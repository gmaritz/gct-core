import { ApplicationService } from "../../application-service";
import {
  AccommodationBookingRequest,
  AccommodationBookingResult,
  AccommodationBookingService,
} from "../../accommodation/booking";
import {
  AccommodationRateRevalidationRequest,
  AccommodationRateRevalidationResult,
  AccommodationRateRevalidationService,
} from "../../accommodation/revalidation";
import { PricingEngine, PricingEngineRequest, withAccommodationPricingInputs } from "../../pricing";
import { Reservation } from "../aggregate";
import { ReservationService, ReservationServiceRequest } from "./index";
import { ReservationPersistenceContext, ReservationRepository } from "../repository";
import { SupplierReference } from "../models";
import {
  AccommodationReservationHandoffInput,
  createAccommodationReservationHandoff,
} from "../integration";

export interface AccommodationBookingOrchestrationRequest {
  readonly pricing: PricingEngineRequest;
  readonly reservation: Omit<ReservationServiceRequest, "snapshots"> & {
    readonly snapshots: Omit<ReservationServiceRequest["snapshots"], "accommodationSnapshots" | "pricingSnapshot">;
  };
  readonly handoff: AccommodationReservationHandoffInput;
}

export interface AccommodationBookingOrchestrationResult {
  readonly successful: boolean;
  readonly reservation: Reservation | null;
  readonly pricing: PricingEngineRequest["pricingRequest"];
  readonly revalidations: ReadonlyArray<AccommodationRateRevalidationResult>;
  readonly bookings: ReadonlyArray<AccommodationBookingResult>;
  readonly errors: ReadonlyArray<string>;
  readonly warnings: ReadonlyArray<string>;
}

export class AccommodationBookingOrchestrationService
  implements ApplicationService<AccommodationBookingOrchestrationRequest, AccommodationBookingOrchestrationResult> {
  public constructor(
    private readonly pricingEngine: PricingEngine,
    private readonly reservationService: ReservationService,
    private readonly revalidationService: AccommodationRateRevalidationService,
    private readonly bookingService: AccommodationBookingService,
    private readonly reservationRepository?: ReservationRepository,
  ) {}

  public async fulfilReservation(
    reservation: Reservation,
    handoff: AccommodationReservationHandoffInput,
    persistenceContext: ReservationPersistenceContext,
  ): Promise<AccommodationBookingOrchestrationResult> {
    const accommodationHandoff = createAccommodationReservationHandoff(handoff);
    const { revalidations, bookings, errors, warnings } = await this.bookAccommodation(
      accommodationHandoff.bookingRequests,
    );
    const fulfilledReservation = Reservation.restore({
      identity: reservation.identity,
      reservationNumber: reservation.reservationNumber,
      status: reservation.status,
      journeySnapshot: reservation.journeySnapshot,
      travellerSnapshots: reservation.travellerSnapshots,
      accommodationSnapshots: reservation.accommodationSnapshots,
      bookingItems: reservation.bookingItems,
      pricingSnapshot: reservation.pricingSnapshot,
      paymentSnapshot: reservation.paymentSnapshot,
      supplierReferences: createSupplierReferences(accommodationHandoff.bookingRequests, bookings),
      timeline: reservation.timeline,
      metadata: { ...reservation.metadata, updatedAt: new Date() },
    });
    if (this.reservationRepository) {
      await this.reservationRepository.save(fulfilledReservation, persistenceContext);
    }
    return Object.freeze({
      successful: errors.length === 0 && bookings.length === accommodationHandoff.bookingRequests.length,
      reservation: fulfilledReservation,
      pricing: handoff.finalPackagePrice as PricingEngineRequest["pricingRequest"],
      revalidations: Object.freeze(revalidations),
      bookings: Object.freeze(bookings),
      errors: Object.freeze(errors),
      warnings: Object.freeze(warnings),
    });
  }

  public async execute(
    request: AccommodationBookingOrchestrationRequest,
  ): Promise<AccommodationBookingOrchestrationResult> {
    const pricingRequest = withAccommodationPricingInputs(
      request.pricing.pricingRequest,
      request.handoff.pricingInputs,
    );
    const pricingResult = await this.pricingEngine.execute({
      ...request.pricing,
      pricingRequest,
    });

    if (!pricingResult.successful || !pricingResult.pricing) {
      return Object.freeze({
        successful: false,
        reservation: null,
        pricing: pricingRequest,
        revalidations: Object.freeze([]),
        bookings: Object.freeze([]),
        errors: Object.freeze(["Package pricing failed."]),
        warnings: pricingResult.warnings,
      });
    }

    const handoff = createAccommodationReservationHandoff({
      ...request.handoff,
      finalPackagePrice: {
        amount: pricingResult.pricing.totals.grandTotal.amount,
        currency: pricingResult.pricing.currency,
      },
    });
    const reservationResult = await this.reservationService.execute({
      ...request.reservation,
      snapshots: {
        ...request.reservation.snapshots,
        accommodationSnapshots: handoff.accommodationSnapshots,
        pricingSnapshot: {
          snapshotId: `pricing-${request.reservation.query.requestId}`,
          capturedAt: new Date(),
          version: "1.0.0",
          currency: pricingResult.pricing.currency,
          totalPrice: pricingResult.pricing.totals.grandTotal.amount,
          taxes: pricingResult.pricing.totals.taxTotal.amount,
          discounts: pricingResult.pricing.totals.discountTotal.amount,
          fees: pricingResult.pricing.totals.feeTotal.amount,
        },
      },
    });

    if (!reservationResult.successful || !reservationResult.reservation) {
      return Object.freeze({
        successful: false,
        reservation: null,
        pricing: pricingRequest,
        revalidations: Object.freeze([]),
        bookings: Object.freeze([]),
        errors: Object.freeze(reservationResult.errors),
        warnings: Object.freeze([...pricingResult.warnings, ...reservationResult.warnings]),
      });
    }

    const bookingOutcome = await this.bookAccommodation(handoff.bookingRequests);
    const revalidations = bookingOutcome.revalidations;
    const bookings = bookingOutcome.bookings;
    const errors = [...bookingOutcome.errors];

    return Object.freeze({
      successful: errors.length === 0 && bookings.length === handoff.bookingRequests.length,
      reservation: reservationResult.reservation,
      pricing: pricingRequest,
      revalidations: Object.freeze(revalidations),
      bookings: Object.freeze(bookings),
      errors: Object.freeze(errors),
      warnings: Object.freeze([...pricingResult.warnings, ...reservationResult.warnings]),
    });
  }

  private async bookAccommodation(
    bookingRequests: ReadonlyArray<AccommodationBookingRequest>,
  ): Promise<{ readonly revalidations: ReadonlyArray<AccommodationRateRevalidationResult>; readonly bookings: ReadonlyArray<AccommodationBookingResult>; readonly errors: ReadonlyArray<string>; readonly warnings: ReadonlyArray<string> }> {
    const revalidations: AccommodationRateRevalidationResult[] = [];
    const bookings: AccommodationBookingResult[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];
    for (const bookingRequest of bookingRequests) {
      let currentRequest = bookingRequest;
      if (bookingRequest.rate.status === "RECHECK_REQUIRED") {
        const revalidation = await this.revalidationService.execute({
          accommodation: bookingRequest.accommodation,
          room: bookingRequest.room,
          rate: bookingRequest.rate,
          providerReference: bookingRequest.providerReference,
          stayPeriod: bookingRequest.stayPeriod,
          occupancy: bookingRequest.occupancy,
          packageStopId: bookingRequest.packageStopId,
        } as AccommodationRateRevalidationRequest);
        revalidations.push(revalidation);
        if ((revalidation.status !== "VALID" && revalidation.status !== "CHANGED") || !revalidation.currentRate) {
          errors.push(`Revalidation failed for stop ${bookingRequest.packageStopId ?? "unknown"}.`);
          continue;
        }
        currentRequest = { ...bookingRequest, rate: revalidation.currentRate, validatedRate: revalidation.currentRate };
      }
      let booking: AccommodationBookingResult;
      try {
        booking = await this.bookingService.execute(currentRequest);
      } catch (error) {
        booking = {
          successful: false,
          status: "UNKNOWN",
          provider: currentRequest.providerReference.provider,
          accommodation: currentRequest.accommodation,
          room: currentRequest.room,
          rate: currentRequest.rate,
          packageStopId: currentRequest.packageStopId,
          errors: [{
            code: "SUPPLIER_OPERATION_UNKNOWN",
            message: error instanceof Error ? error.message : "Supplier booking outcome is unknown.",
          }],
          warnings: [],
        };
      }
      bookings.push(booking);
      warnings.push(...booking.warnings);
      if (!booking.successful || booking.status !== "CONFIRMED") {
        errors.push(`Booking did not confirm for stop ${bookingRequest.packageStopId ?? "unknown"}.`);
      }
    }
    return { revalidations, bookings, errors, warnings };
  }
}

function createSupplierReferences(
  requests: ReadonlyArray<AccommodationBookingRequest>,
  bookings: ReadonlyArray<AccommodationBookingResult>,
): ReadonlyArray<SupplierReference> {
  return Object.freeze(requests.map((request, index) => {
    const booking = bookings.find((candidate) => candidate.packageStopId === request.packageStopId);
    return Object.freeze({
      snapshotId: `supplier-reference-${request.packageStopId ?? index}`,
      capturedAt: new Date(),
      version: "1.0.0",
      providerId: booking?.provider ?? request.providerReference.provider,
      supplierBookingReference: booking?.supplierBookingReference ?? `pending-${request.packageStopId ?? index}`,
      supplierId: booking?.provider ?? request.providerReference.provider,
      reservationReference: booking?.supplierBookingReference,
      reservationStatusId: booking?.status ?? "UNKNOWN",
      reservedAt: new Date(),
      confirmedAt: booking?.status === "CONFIRMED" ? new Date() : undefined,
    });
  }));
}
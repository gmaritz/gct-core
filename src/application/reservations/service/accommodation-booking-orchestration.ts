import { ApplicationService } from "../../application-service";
import {
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
  ) {}

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

    const revalidations: AccommodationRateRevalidationResult[] = [];
    const bookings: AccommodationBookingResult[] = [];
    const errors: string[] = [];

    for (const bookingRequest of handoff.bookingRequests) {
      let currentRequest = bookingRequest;
      if (bookingRequest.rate.status === "RECHECK_REQUIRED") {
        const revalidationRequest: AccommodationRateRevalidationRequest = {
          accommodation: bookingRequest.accommodation,
          room: bookingRequest.room,
          rate: bookingRequest.rate,
          providerReference: bookingRequest.providerReference,
          stayPeriod: bookingRequest.stayPeriod,
          occupancy: bookingRequest.occupancy,
          packageStopId: bookingRequest.packageStopId,
        };
        const revalidation = await this.revalidationService.execute(revalidationRequest);
        revalidations.push(revalidation);
        if (revalidation.status !== "VALID" && revalidation.status !== "CHANGED" || !revalidation.currentRate) {
          errors.push(`Revalidation failed for stop ${bookingRequest.packageStopId ?? "unknown"}.`);
          continue;
        }
        currentRequest = { ...bookingRequest, rate: revalidation.currentRate, validatedRate: revalidation.currentRate };
      }
      const booking = await this.bookingService.execute(currentRequest);
      bookings.push(booking);
      if (!booking.successful || booking.status !== "CONFIRMED") {
        errors.push(`Booking did not confirm for stop ${bookingRequest.packageStopId ?? "unknown"}.`);
      }
    }

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
}
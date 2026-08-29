import { CustomerResolutionService } from "../../../customers";
import {
  ReservationService,
  ReservationServiceRequest,
  ReservationTimelineMilestone,
} from "../../../reservations";
import { ReservationReviewResult } from "./reservation-review-service";

export interface CustomerJourneyReservationResult {
  readonly successful: boolean;
  readonly errors: ReadonlyArray<string>;
}

export class CustomerJourneyReservationService {
  public constructor(
    private readonly customerResolutionService: CustomerResolutionService,
    private readonly reservationService: ReservationService,
  ) {}

  public async create(review: ReservationReviewResult): Promise<CustomerJourneyReservationResult> {
    if (review.status !== "READY" || !review.confirmed || !review.journey || !review.quote?.pricing?.pricing || !review.guestInformation) {
      return { successful: false, errors: ["A confirmed review is required before creating a reservation."] };
    }

    const leadTraveller = review.guestInformation.travellers[review.guestInformation.leadTravellerIndex];
    if (!leadTraveller) return { successful: false, errors: ["A lead traveller is required before creating a reservation."] };

    const customer = await this.customerResolutionService.resolveOrCreate({
      email: review.guestInformation.contact.email,
      firstName: leadTraveller.firstName,
      lastName: leadTraveller.lastName,
      phone: review.guestInformation.contact.phone,
    });
    const selected = review.quote.selections.map((selection) => {
      const accommodation = review.journey!.accommodation.find((candidate) => candidate.accommodationId === selection.accommodationId);
      const room = accommodation?.roomOptions?.find((candidate) => candidate.reference.opaqueReference === selection.roomReference.opaqueReference);
      const rate = room?.rateOptions.find((candidate) => candidate.reference.opaqueReference === selection.rateReference.opaqueReference);
      return accommodation && room && rate
        ? { accommodation, room, rate }
        : undefined;
    });
    if (selected.some((item) => !item)) return { successful: false, errors: ["Selected accommodation is no longer available."] };

    const stays = selected as Array<{ accommodation: NonNullable<ReservationReviewResult["journey"]>["accommodation"][number]; room: NonNullable<NonNullable<ReservationReviewResult["journey"]>["accommodation"][number]["roomOptions"]>[number]; rate: NonNullable<NonNullable<NonNullable<ReservationReviewResult["journey"]>["accommodation"][number]["roomOptions"]>[number]["rateOptions"]>[number] }>;
    const firstStay = stays[0]?.accommodation.packageStop;
    const lastStay = stays[stays.length - 1]?.accommodation.packageStop;
    if (!firstStay || !lastStay) return { successful: false, errors: ["Selected accommodation stay dates are unavailable."] };

    const now = new Date();
    const pricing = review.quote.pricing.pricing;
    const request: ReservationServiceRequest = {
      query: {
        requestId: `reservation-${review.journeyId}`,
        customerId: customer.customerId,
        journeyId: review.journeyId,
        checkInDate: firstStay.checkInDate,
        checkOutDate: lastStay.checkOutDate,
        travellers: review.guestInformation.travellers.map((traveller, index) => ({
          travellerId: `${review.journeyId}-traveller-${index + 1}`,
          fullName: `${traveller.firstName} ${traveller.lastName}`.trim(),
          email: traveller.email,
          dateOfBirth: traveller.dateOfBirth ? new Date(traveller.dateOfBirth) : undefined,
        })),
      },
      snapshots: {
        journeySnapshot: {
          snapshotId: `journey-${review.journeyId}`,
          capturedAt: now,
          version: "1.0.0",
          journeyId: review.journeyId,
          title: `${review.journey.classification.category} ${review.journey.destinations[0]?.name ?? "Journey"}`,
          destination: review.journey.destinations.map((destination) => destination.name).join(" + "),
          duration: review.journey.duration.description,
          startDate: firstStay.checkInDate,
          endDate: lastStay.checkOutDate,
        },
        travellerSnapshots: review.guestInformation.travellers.map((traveller, index) => ({
          snapshotId: `traveller-${review.journeyId}-${index + 1}`,
          capturedAt: now,
          version: "1.0.0",
          travellerId: `${review.journeyId}-traveller-${index + 1}`,
          fullName: `${traveller.firstName} ${traveller.lastName}`.trim(),
          email: traveller.email,
          phone: index === review.guestInformation!.leadTravellerIndex ? review.guestInformation!.contact.phone : undefined,
          nationality: traveller.nationality,
          travellerType: traveller.travellerType,
          dateOfBirth: traveller.dateOfBirth ? new Date(traveller.dateOfBirth) : undefined,
        })),
        accommodationSnapshots: stays.map(({ accommodation, room, rate }, index) => ({
          snapshotId: `accommodation-${review.journeyId}-${index + 1}`,
          capturedAt: now,
          version: "1.0.0",
          accommodationId: accommodation.accommodationId,
          propertyName: accommodation.name,
          roomType: room.name,
          mealBasis: rate.board?.name,
          checkInDate: accommodation.packageStop?.checkInDate,
          checkOutDate: accommodation.packageStop?.checkOutDate,
          packageId: accommodation.packageStop?.packageId,
          packageStopId: accommodation.packageStop?.stopId,
          stopOrder: accommodation.packageStop?.stopOrder,
          rateReference: rate.reference,
          roomReference: room.reference,
          provider: rate.reference.provider,
          occupancy: rate.occupancy ?? accommodation.requestedOccupancy,
          supplierPrice: rate.pricing,
        })),
        pricingSnapshot: {
          snapshotId: `pricing-${review.journeyId}`,
          capturedAt: now,
          version: "1.0.0",
          currency: pricing.currency,
          totalPrice: pricing.totals.grandTotal.amount,
          taxes: pricing.totals.taxTotal.amount,
          discounts: pricing.totals.discountTotal.amount,
          fees: pricing.totals.feeTotal.amount,
        },
        paymentSnapshot: {
          snapshotId: `payment-${review.journeyId}`,
          capturedAt: now,
          version: "1.0.0",
          paymentStatus: "CREATED",
          amountReceived: 0,
          balanceOutstanding: pricing.totals.grandTotal.amount,
        },
        metadata: { createdAt: now, updatedAt: now, version: "1.0.0" },
      },
      metadata: { createdAt: now, updatedAt: now, version: "1.0.0" },
      timelineSeed: [{
        snapshotId: `timeline-${review.journeyId}-created`,
        capturedAt: now,
        version: "1.0.0",
        milestone: ReservationTimelineMilestone.CREATED,
        occurredAt: now,
      }],
    };
    const result = await this.reservationService.execute(request);
    return { successful: result.successful, errors: result.errors };
  }
}
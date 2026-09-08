"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerJourneyReservationService = void 0;
const reservations_1 = require("../../../reservations");
const journeys_1 = require("../../../journeys");
class CustomerJourneyReservationService {
    constructor(customerResolutionService, reservationService, bookingOrchestration) {
        this.customerResolutionService = customerResolutionService;
        this.reservationService = reservationService;
        this.bookingOrchestration = bookingOrchestration;
    }
    async create(review) {
        if (review.status !== "READY" || !review.confirmed || !review.journey || !review.quote?.pricing?.pricing || !review.guestInformation) {
            return { successful: false, errors: ["A confirmed review is required before creating a reservation."] };
        }
        const leadTraveller = review.guestInformation.travellers[review.guestInformation.leadTravellerIndex];
        if (!leadTraveller)
            return { successful: false, errors: ["A lead traveller is required before creating a reservation."] };
        const customer = await this.customerResolutionService.resolveOrCreate({
            email: review.guestInformation.contact.email,
            firstName: leadTraveller.firstName,
            lastName: leadTraveller.lastName,
            phone: review.guestInformation.contact.phone,
        });
        const selected = review.quote.selections.map((selection) => {
            const accommodation = review.journey.accommodation.find((candidate) => candidate.accommodationId === selection.accommodationId
                && (!selection.stopId || candidate.packageStop?.stopId === selection.stopId));
            const room = accommodation?.roomOptions?.find((candidate) => candidate.reference.opaqueReference === selection.roomReference.opaqueReference);
            const rate = room?.rateOptions.find((candidate) => candidate.reference.opaqueReference === selection.rateReference.opaqueReference);
            return accommodation && room && rate
                ? { accommodation, room, rate }
                : undefined;
        });
        if (selected.some((item) => !item))
            return { successful: false, errors: ["Selected accommodation is no longer available."] };
        const stays = selected;
        const firstStay = stays[0]?.accommodation.packageStop;
        const lastStay = stays[stays.length - 1]?.accommodation.packageStop;
        if (!firstStay || !lastStay)
            return { successful: false, errors: ["Selected accommodation stay dates are unavailable."] };
        const now = new Date();
        const pricing = review.quote.pricing.pricing;
        const request = {
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
                    phone: index === review.guestInformation.leadTravellerIndex ? review.guestInformation.contact.phone : undefined,
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
                    milestone: reservations_1.ReservationTimelineMilestone.CREATED,
                    occurredAt: now,
                }],
        };
        const result = await this.reservationService.executeIfAbsent(request);
        if (!result.successful || !result.reservation || !this.bookingOrchestration) {
            return { successful: result.successful, errors: result.errors };
        }
        const pricingInputs = stays.map(({ accommodation, room, rate }) => {
            const selectedAccommodation = (0, journeys_1.selectJourneyAccommodation)(accommodation, {
                accommodationId: accommodation.accommodationId,
                packageStopId: accommodation.packageStop?.stopId,
                roomReference: room.reference,
                rateReference: rate.reference,
            });
            if (!selectedAccommodation.pricingInput)
                throw new Error("Selected accommodation pricing input is unavailable.");
            return selectedAccommodation.pricingInput;
        });
        const reservationInputs = stays.map(({ accommodation, room, rate }) => ({
            ...pricingInputs.find((input) => input.packageStopId === accommodation.packageStop?.stopId),
            accommodationId: accommodation.accommodationId,
            room,
            rate,
            occupancy: rate.occupancy ?? accommodation.requestedOccupancy,
            provider: rate.reference.provider,
            supplierReference: rate.reference,
        }));
        const handoff = {
            packageId: firstStay.packageId,
            pricingInputs,
            reservationInputs,
            finalPackagePrice: {
                amount: pricing.totals.grandTotal.amount,
                currency: pricing.currency,
            },
            holder: {
                firstName: leadTraveller.firstName,
                lastName: leadTraveller.lastName,
                email: review.guestInformation.contact.email,
                phone: review.guestInformation.contact.phone,
            },
            guests: review.guestInformation.travellers.flatMap((traveller, index) => {
                const roomCount = pricingInputs[0]?.occupancy?.rooms.length ?? 1;
                return [{
                        roomIndex: Math.min(index, roomCount - 1),
                        type: traveller.travellerType,
                        firstName: traveller.firstName,
                        lastName: traveller.lastName,
                        age: traveller.dateOfBirth ? Math.max(0, new Date().getFullYear() - new Date(traveller.dateOfBirth).getFullYear()) : undefined,
                    }];
            }),
            idempotencyKey: `reservation-${review.journeyId}`,
        };
        const fulfilment = await this.bookingOrchestration.fulfilReservation(result.reservation, handoff, {
            customerId: customer.customerId,
            bookingStartDate: firstStay.checkInDate,
            bookingEndDate: lastStay.checkOutDate,
        });
        return {
            successful: true,
            errors: fulfilment.errors,
        };
    }
}
exports.CustomerJourneyReservationService = CustomerJourneyReservationService;
//# sourceMappingURL=customer-journey-reservation-service.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerJourneyReservationService = void 0;
const crypto_1 = require("crypto");
const reservations_1 = require("../../../reservations");
const journeys_1 = require("../../../journeys");
function createReservationRequestId(review, stays, totalPrice) {
    const fingerprint = {
        journeyId: review.journeyId,
        stays: stays.map(({ accommodation, roomRates }) => ({
            stopId: accommodation.packageStop?.stopId,
            checkIn: accommodation.packageStop?.checkInDate.toISOString(),
            checkOut: accommodation.packageStop?.checkOutDate.toISOString(),
            accommodationId: accommodation.accommodationId,
            roomRates: roomRates.map(({ room, rate }) => ({
                roomReference: room.reference,
                rateReference: rate.reference,
                amount: rate.pricing.amount,
                currency: rate.pricing.currency,
            })),
        })),
        totalPrice,
        contactEmail: review.guestInformation?.contact.email,
        travellers: review.guestInformation?.travellers.map((traveller) => ({
            firstName: traveller.firstName,
            lastName: traveller.lastName,
            email: traveller.email,
            dateOfBirth: traveller.dateOfBirth,
        })),
    };
    const digest = (0, crypto_1.createHash)("sha256").update(JSON.stringify(fingerprint)).digest("hex").slice(0, 24);
    return `reservation-${review.journeyId}-${digest}`;
}
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
        const selected = review.quote.selections.map((selection) => {
            const accommodation = review.journey.accommodation.find((candidate) => candidate.accommodationId === selection.accommodationId
                && (!selection.stopId || candidate.packageStop?.stopId === selection.stopId));
            const roomSelections = selection.roomSelections ?? (selection.roomReference && selection.rateReference
                ? [{ roomReference: selection.roomReference, rateReference: selection.rateReference }]
                : []);
            const roomRates = roomSelections.map((roomSelection) => {
                const room = accommodation?.roomOptions?.find((candidate) => candidate.reference.provider === roomSelection.roomReference.provider
                    && candidate.reference.opaqueReference === roomSelection.roomReference.opaqueReference);
                const rate = room?.rateOptions.find((candidate) => candidate.reference.provider === roomSelection.rateReference.provider
                    && candidate.reference.opaqueReference === roomSelection.rateReference.opaqueReference);
                return room && rate ? { room, rate } : undefined;
            });
            const validRoomRates = roomRates.filter((roomRate) => roomRate !== undefined);
            return accommodation && validRoomRates.length > 0 && validRoomRates.length === roomSelections.length
                ? { accommodation, roomRates: validRoomRates }
                : undefined;
        });
        if (selected.some((item) => !item))
            return { successful: false, errors: ["Selected accommodation is no longer available."] };
        const stays = selected.flatMap((item) => item ? [item] : []).sort((left, right) => (left.accommodation.packageStop?.stopOrder ?? 0) - (right.accommodation.packageStop?.stopOrder ?? 0));
        const firstStay = stays[0]?.accommodation.packageStop;
        const lastStay = stays[stays.length - 1]?.accommodation.packageStop;
        if (!firstStay || !lastStay)
            return { successful: false, errors: ["Selected accommodation stay dates are unavailable."] };
        const customer = await this.customerResolutionService.resolveOrCreate({
            email: review.guestInformation.contact.email,
            firstName: leadTraveller.firstName,
            lastName: leadTraveller.lastName,
            phone: review.guestInformation.contact.phone,
        });
        const now = new Date();
        const pricing = review.quote.pricing.pricing;
        const reservationRequestId = createReservationRequestId(review, stays, pricing.totals.grandTotal.amount);
        const request = {
            query: {
                requestId: reservationRequestId,
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
                    snapshotId: `journey-${reservationRequestId}`,
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
                    snapshotId: `traveller-${reservationRequestId}-${index + 1}`,
                    capturedAt: now,
                    version: "1.0.0",
                    travellerId: `${reservationRequestId}-traveller-${index + 1}`,
                    fullName: `${traveller.firstName} ${traveller.lastName}`.trim(),
                    email: traveller.email,
                    phone: index === review.guestInformation.leadTravellerIndex ? review.guestInformation.contact.phone : undefined,
                    nationality: traveller.nationality,
                    travellerType: traveller.travellerType,
                    dateOfBirth: traveller.dateOfBirth ? new Date(traveller.dateOfBirth) : undefined,
                })),
                accommodationSnapshots: stays.map(({ accommodation, roomRates }, index) => ({
                    snapshotId: `accommodation-${reservationRequestId}-${index + 1}`,
                    capturedAt: now,
                    version: "1.0.0",
                    accommodationId: accommodation.accommodationId,
                    propertyName: accommodation.name,
                    roomType: roomRates.map(({ room }) => room.name).join(", "),
                    mealBasis: roomRates[0]?.rate.board?.name,
                    checkInDate: accommodation.packageStop?.checkInDate,
                    checkOutDate: accommodation.packageStop?.checkOutDate,
                    packageId: accommodation.packageStop?.packageId,
                    packageStopId: accommodation.packageStop?.stopId,
                    stopOrder: accommodation.packageStop?.stopOrder,
                    rateReference: roomRates[0]?.rate.reference,
                    roomReference: roomRates[0]?.room.reference,
                    provider: roomRates[0]?.rate.reference.provider,
                    occupancy: accommodation.requestedOccupancy ?? roomRates[0]?.rate.occupancy,
                    supplierPrice: {
                        amount: roomRates.reduce((sum, item) => sum + item.rate.pricing.amount, 0),
                        currency: roomRates[0]?.rate.pricing.currency ?? "UNKNOWN",
                        basis: roomRates[0]?.rate.pricing.basis,
                    },
                    selectedRooms: roomRates.map(({ room, rate }) => ({
                        roomType: room.name,
                        roomReference: room.reference,
                        rateReference: rate.reference,
                        supplierPrice: rate.pricing,
                    })),
                })),
                pricingSnapshot: {
                    snapshotId: `pricing-${reservationRequestId}`,
                    capturedAt: now,
                    version: "1.0.0",
                    currency: pricing.currency,
                    totalPrice: pricing.totals.grandTotal.amount,
                    taxes: pricing.totals.taxTotal.amount,
                    discounts: pricing.totals.discountTotal.amount,
                    fees: pricing.totals.feeTotal.amount,
                },
                paymentSnapshot: {
                    snapshotId: `payment-${reservationRequestId}`,
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
                    snapshotId: `timeline-${reservationRequestId}-created`,
                    capturedAt: now,
                    version: "1.0.0",
                    milestone: reservations_1.ReservationTimelineMilestone.CREATED,
                    occurredAt: now,
                }],
        };
        const pricingInputs = stays.map(({ accommodation, roomRates }) => {
            const firstRoomRate = roomRates[0];
            const selectedAccommodation = (0, journeys_1.selectJourneyAccommodation)(accommodation, {
                accommodationId: accommodation.accommodationId,
                packageStopId: accommodation.packageStop?.stopId,
                roomReference: firstRoomRate.room.reference,
                rateReference: firstRoomRate.rate.reference,
                roomSelections: roomRates.map(({ room, rate }) => ({
                    roomReference: room.reference,
                    rateReference: rate.reference,
                })),
            });
            if (!selectedAccommodation.pricingInput)
                throw new Error("Selected accommodation pricing input is unavailable.");
            return selectedAccommodation.pricingInput;
        });
        const reservationInputs = stays.map(({ accommodation, roomRates }) => ({
            ...pricingInputs.find((input) => input.packageStopId === accommodation.packageStop?.stopId),
            accommodationId: accommodation.accommodationId,
            room: roomRates[0].room,
            rate: roomRates[0].rate,
            roomRates,
            occupancy: accommodation.requestedOccupancy ?? roomRates[0].rate.occupancy,
            provider: roomRates[0].rate.reference.provider,
            supplierReference: roomRates[0].rate.reference,
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
            guests: assignGuestsToRooms(review.guestInformation.travellers, pricingInputs[0]?.occupancy?.rooms ?? []),
            idempotencyKey: reservationRequestId,
        };
        const result = await this.reservationService.executeIfAbsent(request);
        if (!result.successful || !result.reservation || !this.bookingOrchestration) {
            return { successful: result.successful, errors: result.errors };
        }
        const fulfilment = await this.bookingOrchestration.fulfilReservation(result.reservation, handoff, {
            customerId: customer.customerId,
            bookingStartDate: firstStay.checkInDate,
            bookingEndDate: lastStay.checkOutDate,
        });
        return {
            successful: fulfilment.successful,
            errors: fulfilment.errors,
        };
    }
}
exports.CustomerJourneyReservationService = CustomerJourneyReservationService;
function assignGuestsToRooms(travellers, occupancies) {
    const usedAdults = occupancies.map(() => 0);
    const usedChildren = occupancies.map(() => 0);
    return travellers.map((traveller) => {
        const isChild = traveller.travellerType === "CHILD";
        const roomIndex = occupancies.findIndex((occupancy, index) => isChild
            ? usedChildren[index] < occupancy.children
            : usedAdults[index] < occupancy.adults);
        if (roomIndex < 0)
            throw new Error("Selected room allocation does not match the guest list.");
        if (isChild)
            usedChildren[roomIndex] += 1;
        else
            usedAdults[roomIndex] += 1;
        return Object.freeze({
            roomIndex,
            type: traveller.travellerType,
            firstName: traveller.firstName,
            lastName: traveller.lastName,
            age: traveller.dateOfBirth ? Math.max(0, new Date().getFullYear() - new Date(traveller.dateOfBirth).getFullYear()) : undefined,
        });
    });
}
//# sourceMappingURL=customer-journey-reservation-service.js.map
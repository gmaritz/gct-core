"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccommodationBookingOrchestrationService = void 0;
const pricing_1 = require("../../pricing");
const integration_1 = require("../integration");
class AccommodationBookingOrchestrationService {
    constructor(pricingEngine, reservationService, revalidationService, bookingService) {
        this.pricingEngine = pricingEngine;
        this.reservationService = reservationService;
        this.revalidationService = revalidationService;
        this.bookingService = bookingService;
    }
    async execute(request) {
        const pricingRequest = (0, pricing_1.withAccommodationPricingInputs)(request.pricing.pricingRequest, request.handoff.pricingInputs);
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
        const handoff = (0, integration_1.createAccommodationReservationHandoff)({
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
        const revalidations = [];
        const bookings = [];
        const errors = [];
        for (const bookingRequest of handoff.bookingRequests) {
            let currentRequest = bookingRequest;
            if (bookingRequest.rate.status === "RECHECK_REQUIRED") {
                const revalidationRequest = {
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
exports.AccommodationBookingOrchestrationService = AccommodationBookingOrchestrationService;
//# sourceMappingURL=accommodation-booking-orchestration.js.map
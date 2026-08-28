"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultReservationConfirmationService = void 0;
const aggregate_1 = require("../aggregate");
function paymentState(reservation) {
    return reservation.paymentSnapshot?.paymentStatus?.trim().toUpperCase();
}
function fulfilmentState(reservation) {
    const supplierStates = reservation.bookingItems.flatMap((item) => (item.supplierBookings ?? []).map((supplier) => supplier.status.trim().toUpperCase()));
    if (supplierStates.length === 0) {
        return reservation.supplierReferences.length > 0 ? "CONFIRMED" : "PENDING";
    }
    if (supplierStates.some((status) => status === "FAILED" || status === "CANCELLED")) {
        return "FAILED";
    }
    return supplierStates.every((status) => status === "CONFIRMED" || status === "COMPLETED")
        ? "CONFIRMED"
        : "PENDING";
}
function resolveStatus(reservation) {
    if (reservation.status === aggregate_1.ReservationStatus.CANCELLED)
        return "CANCELLED";
    const payment = paymentState(reservation);
    if (payment === "FAILED")
        return "FAILED";
    if (payment === "CANCELLED")
        return "CANCELLED";
    if (!payment || !["COMPLETED", "PAID", "SETTLED", "CAPTURED"].includes(payment))
        return "PENDING";
    if (reservation.status !== aggregate_1.ReservationStatus.CONFIRMED && reservation.status !== aggregate_1.ReservationStatus.COMPLETED)
        return "PENDING";
    return fulfilmentState(reservation) === "CONFIRMED" ? "CONFIRMED" : "PENDING";
}
class DefaultReservationConfirmationService {
    constructor(repository) {
        this.repository = repository;
    }
    async resolve(journeyId) {
        if (typeof journeyId !== "string" || !/^journey-[a-z0-9-]+$/i.test(journeyId)) {
            return { status: "INVALID", journeyId, errors: ["The journey reference is invalid."] };
        }
        const reservations = await this.repository.findByJourneyId(journeyId);
        const reservation = reservations[0];
        if (!reservation)
            return { status: "NOT_FOUND", journeyId, errors: ["The reservation could not be found."] };
        return {
            status: resolveStatus(reservation),
            journeyId,
            reservation,
            paymentStatus: paymentState(reservation),
            fulfilmentStatus: fulfilmentState(reservation),
            errors: [],
        };
    }
}
exports.DefaultReservationConfirmationService = DefaultReservationConfirmationService;
//# sourceMappingURL=reservation-confirmation-service.js.map
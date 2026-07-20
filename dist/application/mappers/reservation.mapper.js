"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationMapper = void 0;
/**
 * Reservation Mapper
 *
 * Maps between Reservation aggregate and ReservationDTO.
 */
const aggregates_1 = require("@domain/aggregates");
const value_objects_1 = require("@domain/value-objects");
class ReservationMapper {
    static toPersistence(reservation) {
        const price = reservation.getTotalPrice();
        return {
            id: reservation.getId(),
            reservationNumber: reservation.getReservationNumber(),
            travelerId: reservation.getTravelerId(),
            journeyId: reservation.getJourneyId(),
            status: reservation.getStatus(),
            amount: price.amount,
            currency: price.currency,
            createdAt: reservation.getCreatedAt(),
            confirmedAt: reservation.getConfirmedAt(),
            cancelledAt: reservation.getCancelledAt(),
        };
    }
    static toDTO(reservation) {
        const price = reservation.getTotalPrice();
        return {
            id: reservation.getId(),
            reservationNumber: reservation.getReservationNumber(),
            travelerId: reservation.getTravelerId(),
            journeyId: reservation.getJourneyId(),
            status: reservation.getStatus(),
            totalPrice: {
                amount: price.amount,
                currency: price.currency,
            },
            createdAt: reservation.getCreatedAt(),
            confirmedAt: reservation.getConfirmedAt(),
            cancelledAt: reservation.getCancelledAt(),
        };
    }
    static toDomain(raw) {
        const totalPrice = value_objects_1.Money.create(raw.amount, raw.currency);
        return aggregates_1.Reservation.restore(raw.id, raw.reservationNumber, raw.travelerId, raw.journeyId, raw.status, totalPrice, raw.createdAt, raw.confirmedAt, raw.cancelledAt);
    }
}
exports.ReservationMapper = ReservationMapper;
//# sourceMappingURL=reservation.mapper.js.map
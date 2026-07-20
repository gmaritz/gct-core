"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelReservationService = void 0;
const exceptions_1 = require("@domain/exceptions");
const reservation_mapper_1 = require("../../mappers/reservation.mapper");
/**
 * CancelReservationService
 *
 * Orchestrates the cancellation of an existing reservation.
 * Cancellation business rules remain within the Reservation aggregate.
 */
class CancelReservationService {
    constructor(reservationRepository) {
        this.reservationRepository = reservationRepository;
    }
    async execute(command) {
        const reservation = await this.reservationRepository.findById(command.reservationId);
        if (!reservation) {
            throw new exceptions_1.ReservationNotFoundException(command.reservationId);
        }
        reservation.cancel(command.reason);
        await this.reservationRepository.save(reservation);
        // Domain events (ReservationCancelledEvent) are available here for publishing.
        reservation.clearDomainEvents();
        return reservation_mapper_1.ReservationMapper.toDTO(reservation);
    }
}
exports.CancelReservationService = CancelReservationService;
//# sourceMappingURL=cancel-reservation.service.js.map
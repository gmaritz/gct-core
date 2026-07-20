"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmReservationService = void 0;
const exceptions_1 = require("@domain/exceptions");
const reservation_mapper_1 = require("../../mappers/reservation.mapper");
/**
 * ConfirmReservationService
 *
 * Orchestrates the confirmation of a pending reservation.
 * Confirmation business rules remain within the Reservation aggregate.
 */
class ConfirmReservationService {
    constructor(reservationRepository) {
        this.reservationRepository = reservationRepository;
    }
    async execute(command) {
        const reservation = await this.reservationRepository.findById(command.reservationId);
        if (!reservation) {
            throw new exceptions_1.ReservationNotFoundException(command.reservationId);
        }
        reservation.confirm();
        await this.reservationRepository.save(reservation);
        // Domain events (ReservationConfirmedEvent) are available here for publishing.
        reservation.clearDomainEvents();
        return reservation_mapper_1.ReservationMapper.toDTO(reservation);
    }
}
exports.ConfirmReservationService = ConfirmReservationService;
//# sourceMappingURL=confirm-reservation.service.js.map
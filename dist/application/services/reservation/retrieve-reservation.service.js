"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetrieveReservationService = void 0;
const exceptions_1 = require("@domain/exceptions");
const reservation_mapper_1 = require("../../mappers/reservation.mapper");
/**
 * RetrieveReservationService
 *
 * Retrieves a reservation by ID and returns a DTO.
 * No business rules — read-only orchestration.
 */
class RetrieveReservationService {
    constructor(reservationRepository) {
        this.reservationRepository = reservationRepository;
    }
    async execute(query) {
        const reservation = await this.reservationRepository.findById(query.reservationId);
        if (!reservation) {
            throw new exceptions_1.ReservationNotFoundException(query.reservationId);
        }
        return reservation_mapper_1.ReservationMapper.toDTO(reservation);
    }
}
exports.RetrieveReservationService = RetrieveReservationService;
//# sourceMappingURL=retrieve-reservation.service.js.map
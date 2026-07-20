"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateReservationService = void 0;
const aggregates_1 = require("@domain/aggregates");
const value_objects_1 = require("@domain/value-objects");
const reservation_mapper_1 = require("../../mappers/reservation.mapper");
/**
 * CreateReservationService
 *
 * Orchestrates the creation of a new reservation.
 * Business rules remain within the Reservation aggregate.
 */
class CreateReservationService {
    constructor(reservationRepository) {
        this.reservationRepository = reservationRepository;
    }
    async execute(command) {
        const totalPrice = value_objects_1.Money.create(command.amount, command.currency);
        const reservation = aggregates_1.Reservation.create(command.travelerId, command.journeyId, totalPrice);
        await this.reservationRepository.save(reservation);
        // Domain events are raised by the aggregate and available here for publishing.
        // Wire an event publisher here once an event bus is configured.
        reservation.clearDomainEvents();
        return reservation_mapper_1.ReservationMapper.toDTO(reservation);
    }
}
exports.CreateReservationService = CreateReservationService;
//# sourceMappingURL=create-reservation.service.js.map
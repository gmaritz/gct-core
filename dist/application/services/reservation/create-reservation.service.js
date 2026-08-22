"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateReservationService = void 0;
const aggregates_1 = require("@domain/aggregates");
const value_objects_1 = require("@domain/value-objects");
const reservation_mapper_1 = require("../../mappers/reservation.mapper");
const reservation_number_generator_1 = require("./reservation-number.generator");
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
        if (!command.customerId?.trim()) {
            throw new Error("Customer ID is required");
        }
        if (!(command.bookingStartDate instanceof Date) || Number.isNaN(command.bookingStartDate.getTime())) {
            throw new Error("Booking start date is required");
        }
        if (!(command.bookingEndDate instanceof Date) || Number.isNaN(command.bookingEndDate.getTime())) {
            throw new Error("Booking end date is required");
        }
        if (command.bookingEndDate.getTime() < command.bookingStartDate.getTime()) {
            throw new Error("Booking end date must be on or after booking start date");
        }
        const totalPrice = value_objects_1.Money.create(command.amount, command.currency);
        const reservationNumber = (0, reservation_number_generator_1.generateReservationNumber)();
        const reservation = aggregates_1.Reservation.create(command.travelerId, command.journeyId, totalPrice, reservationNumber);
        await this.reservationRepository.save(reservation, {
            customerId: command.customerId,
            bookingStartDate: command.bookingStartDate,
            bookingEndDate: command.bookingEndDate,
            bookingStatus: command.bookingStatus,
        });
        // Domain events are raised by the aggregate and available here for publishing.
        // Wire an event publisher here once an event bus is configured.
        reservation.clearDomainEvents();
        return reservation_mapper_1.ReservationMapper.toDTO(reservation);
    }
}
exports.CreateReservationService = CreateReservationService;
//# sourceMappingURL=create-reservation.service.js.map
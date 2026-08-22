import { IReservationRepository } from '@domain/repositories';
import { Reservation } from '@domain/aggregates';
import { Money } from '@domain/value-objects';
import { CreateReservationCommand } from '../../commands/create-reservation.command';
import { ReservationMapper } from '../../mappers/reservation.mapper';
import { ReservationDTO } from '../../dto/reservation.dto';
import { generateReservationNumber } from './reservation-number.generator';

/**
 * CreateReservationService
 *
 * Orchestrates the creation of a new reservation.
 * Business rules remain within the Reservation aggregate.
 */
export class CreateReservationService {
  constructor(private readonly reservationRepository: IReservationRepository) {}

  async execute(command: CreateReservationCommand): Promise<ReservationDTO> {
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

    const totalPrice = Money.create(command.amount, command.currency);
    const reservationNumber = generateReservationNumber();

    const reservation = Reservation.create(
      command.travelerId,
      command.journeyId,
      totalPrice,
      reservationNumber,
    );

    await this.reservationRepository.save(reservation, {
      customerId: command.customerId,
      bookingStartDate: command.bookingStartDate,
      bookingEndDate: command.bookingEndDate,
      bookingStatus: command.bookingStatus,
    });

    // Domain events are raised by the aggregate and available here for publishing.
    // Wire an event publisher here once an event bus is configured.
    reservation.clearDomainEvents();

    return ReservationMapper.toDTO(reservation);
  }
}

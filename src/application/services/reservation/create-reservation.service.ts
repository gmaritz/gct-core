import { IReservationRepository } from '@domain/repositories';
import { Reservation } from '@domain/aggregates';
import { Money } from '@domain/value-objects';
import { CreateReservationCommand } from '../../commands/create-reservation.command';
import { ReservationMapper } from '../../mappers/reservation.mapper';
import { ReservationDTO } from '../../dto/reservation.dto';

/**
 * CreateReservationService
 *
 * Orchestrates the creation of a new reservation.
 * Business rules remain within the Reservation aggregate.
 */
export class CreateReservationService {
  constructor(private readonly reservationRepository: IReservationRepository) {}

  async execute(command: CreateReservationCommand): Promise<ReservationDTO> {
    const totalPrice = Money.create(command.amount, command.currency);

    const reservation = Reservation.create(
      command.travelerId,
      command.journeyId,
      totalPrice
    );

    await this.reservationRepository.save(reservation);

    // Domain events are raised by the aggregate and available here for publishing.
    // Wire an event publisher here once an event bus is configured.
    reservation.clearDomainEvents();

    return ReservationMapper.toDTO(reservation);
  }
}

import { IReservationRepository } from '@domain/repositories';
import { ReservationNotFoundException } from '@domain/exceptions';
import { CancelReservationCommand } from '../../commands/cancel-reservation.command';
import { ReservationMapper } from '../../mappers/reservation.mapper';
import { ReservationDTO } from '../../dto/reservation.dto';

/**
 * CancelReservationService
 *
 * Orchestrates the cancellation of an existing reservation.
 * Cancellation business rules remain within the Reservation aggregate.
 */
export class CancelReservationService {
  constructor(private readonly reservationRepository: IReservationRepository) {}

  async execute(command: CancelReservationCommand): Promise<ReservationDTO> {
    const reservation = await this.reservationRepository.findById(command.reservationId);

    if (!reservation) {
      throw new ReservationNotFoundException(command.reservationId);
    }

    reservation.cancel(command.reason);

    await this.reservationRepository.save(reservation);

    // Domain events (ReservationCancelledEvent) are available here for publishing.
    reservation.clearDomainEvents();

    return ReservationMapper.toDTO(reservation);
  }
}

import { IReservationRepository } from '@domain/repositories';
import { ReservationNotFoundException } from '@domain/exceptions';
import { ConfirmReservationCommand } from '../../commands/confirm-reservation.command';
import { ReservationMapper } from '../../mappers/reservation.mapper';
import { ReservationDTO } from '../../dto/reservation.dto';

/**
 * ConfirmReservationService
 *
 * Orchestrates the confirmation of a pending reservation.
 * Confirmation business rules remain within the Reservation aggregate.
 */
export class ConfirmReservationService {
  constructor(private readonly reservationRepository: IReservationRepository) {}

  async execute(command: ConfirmReservationCommand): Promise<ReservationDTO> {
    const reservation = await this.reservationRepository.findById(command.reservationId);

    if (!reservation) {
      throw new ReservationNotFoundException(command.reservationId);
    }

    reservation.confirm();

    await this.reservationRepository.save(reservation);

    // Domain events (ReservationConfirmedEvent) are available here for publishing.
    reservation.clearDomainEvents();

    return ReservationMapper.toDTO(reservation);
  }
}

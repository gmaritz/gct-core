import { IReservationRepository } from '@domain/repositories';
import { ReservationNotFoundException } from '@domain/exceptions';
import { FindReservationQuery } from '../../queries/find-reservation.query';
import { ReservationMapper } from '../../mappers/reservation.mapper';
import { ReservationDTO } from '../../dto/reservation.dto';

/**
 * RetrieveReservationService
 *
 * Retrieves a reservation by ID and returns a DTO.
 * No business rules — read-only orchestration.
 */
export class RetrieveReservationService {
  constructor(private readonly reservationRepository: IReservationRepository) {}

  async execute(query: FindReservationQuery): Promise<ReservationDTO> {
    const reservation = await this.reservationRepository.findById(query.reservationId);

    if (!reservation) {
      throw new ReservationNotFoundException(query.reservationId);
    }

    return ReservationMapper.toDTO(reservation);
  }
}

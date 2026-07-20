import { FindReservationQuery } from '../queries/find-reservation.query';
import { RetrieveReservationService } from '../services/reservation/retrieve-reservation.service';
import { ReservationDTO } from '../dto/reservation.dto';

/**
 * FindReservationHandler
 *
 * Handles the FindReservationQuery by delegating to RetrieveReservationService.
 */
export class FindReservationHandler {
  constructor(private readonly service: RetrieveReservationService) {}

  async handle(query: FindReservationQuery): Promise<ReservationDTO> {
    return this.service.execute(query);
  }
}

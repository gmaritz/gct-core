import { CancelReservationCommand } from '../commands/cancel-reservation.command';
import { CancelReservationService } from '../services/reservation/cancel-reservation.service';
import { ReservationDTO } from '../dto/reservation.dto';

/**
 * CancelReservationHandler
 *
 * Handles the CancelReservationCommand by delegating to CancelReservationService.
 */
export class CancelReservationHandler {
  constructor(private readonly service: CancelReservationService) {}

  async handle(command: CancelReservationCommand): Promise<ReservationDTO> {
    return this.service.execute(command);
  }
}

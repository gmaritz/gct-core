import { ConfirmReservationCommand } from '../commands/confirm-reservation.command';
import { ConfirmReservationService } from '../services/reservation/confirm-reservation.service';
import { ReservationDTO } from '../dto/reservation.dto';

/**
 * ConfirmReservationHandler
 *
 * Handles the ConfirmReservationCommand by delegating to ConfirmReservationService.
 */
export class ConfirmReservationHandler {
  constructor(private readonly service: ConfirmReservationService) {}

  async handle(command: ConfirmReservationCommand): Promise<ReservationDTO> {
    return this.service.execute(command);
  }
}

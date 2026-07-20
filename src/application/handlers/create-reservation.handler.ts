import { CreateReservationCommand } from '../commands/create-reservation.command';
import { CreateReservationService } from '../services/reservation/create-reservation.service';
import { ReservationDTO } from '../dto/reservation.dto';

/**
 * CreateReservationHandler
 *
 * Handles the CreateReservationCommand by delegating to CreateReservationService.
 */
export class CreateReservationHandler {
  constructor(private readonly service: CreateReservationService) {}

  async handle(command: CreateReservationCommand): Promise<ReservationDTO> {
    return this.service.execute(command);
  }
}

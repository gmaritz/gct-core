import { CreateReservationCommand } from '../commands/create-reservation.command';
import { CreateReservationService } from '../services/reservation/create-reservation.service';
import { ReservationDTO } from '../dto/reservation.dto';
/**
 * CreateReservationHandler
 *
 * Handles the CreateReservationCommand by delegating to CreateReservationService.
 */
export declare class CreateReservationHandler {
    private readonly service;
    constructor(service: CreateReservationService);
    handle(command: CreateReservationCommand): Promise<ReservationDTO>;
}
//# sourceMappingURL=create-reservation.handler.d.ts.map
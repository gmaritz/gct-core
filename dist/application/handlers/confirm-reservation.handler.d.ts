import { ConfirmReservationCommand } from '../commands/confirm-reservation.command';
import { ConfirmReservationService } from '../services/reservation/confirm-reservation.service';
import { ReservationDTO } from '../dto/reservation.dto';
/**
 * ConfirmReservationHandler
 *
 * Handles the ConfirmReservationCommand by delegating to ConfirmReservationService.
 */
export declare class ConfirmReservationHandler {
    private readonly service;
    constructor(service: ConfirmReservationService);
    handle(command: ConfirmReservationCommand): Promise<ReservationDTO>;
}
//# sourceMappingURL=confirm-reservation.handler.d.ts.map
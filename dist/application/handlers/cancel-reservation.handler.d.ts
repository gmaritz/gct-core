import { CancelReservationCommand } from '../commands/cancel-reservation.command';
import { CancelReservationService } from '../services/reservation/cancel-reservation.service';
import { ReservationDTO } from '../dto/reservation.dto';
/**
 * CancelReservationHandler
 *
 * Handles the CancelReservationCommand by delegating to CancelReservationService.
 */
export declare class CancelReservationHandler {
    private readonly service;
    constructor(service: CancelReservationService);
    handle(command: CancelReservationCommand): Promise<ReservationDTO>;
}
//# sourceMappingURL=cancel-reservation.handler.d.ts.map
import { IReservationRepository } from '@domain/repositories';
import { CancelReservationCommand } from '../../commands/cancel-reservation.command';
import { ReservationDTO } from '../../dto/reservation.dto';
/**
 * CancelReservationService
 *
 * Orchestrates the cancellation of an existing reservation.
 * Cancellation business rules remain within the Reservation aggregate.
 */
export declare class CancelReservationService {
    private readonly reservationRepository;
    constructor(reservationRepository: IReservationRepository);
    execute(command: CancelReservationCommand): Promise<ReservationDTO>;
}
//# sourceMappingURL=cancel-reservation.service.d.ts.map
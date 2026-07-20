import { IReservationRepository } from '@domain/repositories';
import { ConfirmReservationCommand } from '../../commands/confirm-reservation.command';
import { ReservationDTO } from '../../dto/reservation.dto';
/**
 * ConfirmReservationService
 *
 * Orchestrates the confirmation of a pending reservation.
 * Confirmation business rules remain within the Reservation aggregate.
 */
export declare class ConfirmReservationService {
    private readonly reservationRepository;
    constructor(reservationRepository: IReservationRepository);
    execute(command: ConfirmReservationCommand): Promise<ReservationDTO>;
}
//# sourceMappingURL=confirm-reservation.service.d.ts.map
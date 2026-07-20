import { IReservationRepository } from '@domain/repositories';
import { CreateReservationCommand } from '../../commands/create-reservation.command';
import { ReservationDTO } from '../../dto/reservation.dto';
/**
 * CreateReservationService
 *
 * Orchestrates the creation of a new reservation.
 * Business rules remain within the Reservation aggregate.
 */
export declare class CreateReservationService {
    private readonly reservationRepository;
    constructor(reservationRepository: IReservationRepository);
    execute(command: CreateReservationCommand): Promise<ReservationDTO>;
}
//# sourceMappingURL=create-reservation.service.d.ts.map
import { IReservationRepository } from '@domain/repositories';
import { FindReservationQuery } from '../../queries/find-reservation.query';
import { ReservationDTO } from '../../dto/reservation.dto';
/**
 * RetrieveReservationService
 *
 * Retrieves a reservation by ID and returns a DTO.
 * No business rules — read-only orchestration.
 */
export declare class RetrieveReservationService {
    private readonly reservationRepository;
    constructor(reservationRepository: IReservationRepository);
    execute(query: FindReservationQuery): Promise<ReservationDTO>;
}
//# sourceMappingURL=retrieve-reservation.service.d.ts.map
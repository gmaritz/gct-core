import { FindReservationQuery } from '../queries/find-reservation.query';
import { RetrieveReservationService } from '../services/reservation/retrieve-reservation.service';
import { ReservationDTO } from '../dto/reservation.dto';
/**
 * FindReservationHandler
 *
 * Handles the FindReservationQuery by delegating to RetrieveReservationService.
 */
export declare class FindReservationHandler {
    private readonly service;
    constructor(service: RetrieveReservationService);
    handle(query: FindReservationQuery): Promise<ReservationDTO>;
}
//# sourceMappingURL=find-reservation.handler.d.ts.map
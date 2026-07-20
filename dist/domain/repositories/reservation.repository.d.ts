import { IRepository } from '../shared/repository';
import { Reservation } from '../aggregates/reservation.aggregate';
/**
 * Repository interface for the Reservation aggregate
 *
 * This interface defines the contract for persisting Reservation aggregates.
 * Implementation is in the Infrastructure layer.
 */
export interface IReservationRepository extends IRepository<Reservation> {
    findByReservationNumber(reservationNumber: string): Promise<Reservation | null>;
    findByTravelerId(travelerId: string): Promise<Reservation[]>;
    findByJourneyId(journeyId: string): Promise<Reservation[]>;
}
//# sourceMappingURL=reservation.repository.d.ts.map
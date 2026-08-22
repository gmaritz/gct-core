import { IRepository } from '../shared/repository';
import { Reservation } from '../aggregates/reservation.aggregate';
export interface ReservationPersistenceContext {
    readonly customerId: string;
    readonly bookingStartDate: Date;
    readonly bookingEndDate: Date;
    readonly bookingStatus?: string;
}
/**
 * Repository interface for the Reservation aggregate
 *
 * This interface defines the contract for persisting Reservation aggregates.
 * Implementation is in the Infrastructure layer.
 */
export interface IReservationRepository extends IRepository<Reservation> {
    save(aggregate: Reservation, context?: ReservationPersistenceContext): Promise<void>;
    findByReservationNumber(reservationNumber: string): Promise<Reservation | null>;
    findByTravelerId(travelerId: string): Promise<Reservation[]>;
    findByJourneyId(journeyId: string): Promise<Reservation[]>;
}
//# sourceMappingURL=reservation.repository.d.ts.map
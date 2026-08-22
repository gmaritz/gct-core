/**
 * Reservation Prisma Repository
 *
 * Implements IReservationRepository using Prisma.
 */
import { IReservationRepository, ReservationPersistenceContext } from '@domain/repositories';
import { Reservation } from '@domain/aggregates';
export declare class ReservationPrismaRepository implements IReservationRepository {
    save(aggregate: Reservation, context?: ReservationPersistenceContext): Promise<void>;
    findById(id: string): Promise<Reservation | null>;
    findByReservationNumber(reservationNumber: string): Promise<Reservation | null>;
    findByTravelerId(travelerId: string): Promise<Reservation[]>;
    findByJourneyId(journeyId: string): Promise<Reservation[]>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=reservation-prisma.repository.d.ts.map
import { PrismaClient } from "@prisma/client";
import { Reservation } from "@application/reservations/aggregate";
import { ReservationPersistenceContext, ReservationRepository } from "@application/reservations/repository";
export declare class CanonicalReservationPrismaRepository implements ReservationRepository {
    private readonly prisma;
    constructor(prisma?: PrismaClient);
    save(reservation: Reservation, context: ReservationPersistenceContext): Promise<void>;
    findById(id: string): Promise<Reservation | null>;
    findByReservationNumber(reservationNumber: string): Promise<Reservation | null>;
    findByTravellerId(travellerId: string): Promise<ReadonlyArray<Reservation>>;
    findByJourneyId(journeyId: string): Promise<ReadonlyArray<Reservation>>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=canonical-reservation-prisma.repository.d.ts.map
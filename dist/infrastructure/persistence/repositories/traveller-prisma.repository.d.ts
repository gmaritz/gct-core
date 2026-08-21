/**
 * Traveller Prisma Repository
 *
 * Implements ITravellerRepository using Prisma.
 */
import { ITravellerRepository, TravellerPersistenceContext } from '@domain/repositories';
import { Traveller } from '@domain/aggregates';
export declare class TravellerPrismaRepository implements ITravellerRepository {
    save(aggregate: Traveller, context?: TravellerPersistenceContext): Promise<void>;
    findById(id: string): Promise<Traveller | null>;
    findByEmail(email: string): Promise<Traveller | null>;
    findAll(): Promise<Traveller[]>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=traveller-prisma.repository.d.ts.map
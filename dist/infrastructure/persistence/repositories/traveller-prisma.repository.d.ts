/**
 * Traveller Prisma Repository
 *
 * Implements ITravellerRepository using Prisma.
 */
import { ITravellerRepository } from '@domain/repositories';
import { Traveller } from '@domain/aggregates';
export declare class TravellerPrismaRepository implements ITravellerRepository {
    save(aggregate: Traveller): Promise<void>;
    findById(id: string): Promise<Traveller | null>;
    findByEmail(email: string): Promise<Traveller | null>;
    findAll(): Promise<Traveller[]>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=traveller-prisma.repository.d.ts.map
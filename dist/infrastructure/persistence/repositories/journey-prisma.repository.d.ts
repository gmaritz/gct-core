/**
 * Journey Prisma Repository
 *
 * Implements IJourneyRepository using Prisma.
 */
import { IJourneyRepository } from '@domain/repositories';
import { Journey } from '@domain/aggregates';
export declare class JourneyPrismaRepository implements IJourneyRepository {
    save(aggregate: Journey): Promise<void>;
    findById(id: string): Promise<Journey | null>;
    findByJourneyCode(journeyCode: string): Promise<Journey | null>;
    findByTravelerId(travelerId: string): Promise<Journey[]>;
    findAll(): Promise<Journey[]>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=journey-prisma.repository.d.ts.map
import { IRepository } from '../shared/repository';
import { Journey } from '../aggregates/journey.aggregate';

/**
 * Repository interface for the Journey aggregate
 * 
 * This interface defines the contract for persisting Journey aggregates.
 * Implementation is in the Infrastructure layer.
 */
export interface IJourneyRepository extends IRepository<Journey> {
  findByJourneyCode(journeyCode: string): Promise<Journey | null>;
  findByTravelerId(travelerId: string): Promise<Journey[]>;
  findAll(): Promise<Journey[]>;
}

import { IRepository } from '../shared/repository';
import { Traveller } from '../aggregates/traveller.aggregate';
/**
 * Repository interface for the Traveller aggregate
 *
 * This interface defines the contract for persisting Traveller aggregates.
 * Implementation is in the Infrastructure layer.
 */
export interface ITravellerRepository extends IRepository<Traveller> {
    findByEmail(email: string): Promise<Traveller | null>;
    findAll(): Promise<Traveller[]>;
}
//# sourceMappingURL=traveller.repository.d.ts.map
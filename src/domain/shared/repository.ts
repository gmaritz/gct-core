/**
 * Repository Interface Base Class
 * 
 * All repository interfaces should extend this class.
 * This defines the common contract for all repositories.
 */
import { AggregateRoot } from './aggregate-root';

export interface IRepository<T extends AggregateRoot> {
  save(aggregate: T): Promise<void>;
  findById(id: string): Promise<T | null>;
  delete(id: string): Promise<void>;
}

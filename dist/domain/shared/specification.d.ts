/**
 * Specification Base Class
 *
 * Implements the Specification pattern for encapsulating business rules.
 * Specifications can be combined to form complex business logic.
 */
import { AggregateRoot } from './aggregate-root';
export declare abstract class Specification<T extends AggregateRoot> {
    abstract isSatisfiedBy(candidate: T): boolean;
    and(other: Specification<T>): Specification<T>;
    or(other: Specification<T>): Specification<T>;
    not(): Specification<T>;
}
//# sourceMappingURL=specification.d.ts.map
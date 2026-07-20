/**
 * Specification Base Class
 * 
 * Implements the Specification pattern for encapsulating business rules.
 * Specifications can be combined to form complex business logic.
 */
import { AggregateRoot } from './aggregate-root';

export abstract class Specification<T extends AggregateRoot> {
  abstract isSatisfiedBy(candidate: T): boolean;

  and(other: Specification<T>): Specification<T> {
    return new CompositeSpecification(this, other, 'AND');
  }

  or(other: Specification<T>): Specification<T> {
    return new CompositeSpecification(this, other, 'OR');
  }

  not(): Specification<T> {
    return new NegationSpecification(this);
  }
}

class CompositeSpecification<T extends AggregateRoot> extends Specification<T> {
  constructor(
    private left: Specification<T>,
    private right: Specification<T>,
    private operator: 'AND' | 'OR'
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    if (this.operator === 'AND') {
      return this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate);
    } else {
      return this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate);
    }
  }
}

class NegationSpecification<T extends AggregateRoot> extends Specification<T> {
  constructor(private specification: Specification<T>) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return !this.specification.isSatisfiedBy(candidate);
  }
}

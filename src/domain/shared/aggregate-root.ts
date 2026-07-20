/**
 * Aggregate Root Base Class
 * 
 * All aggregate roots should extend this class.
 * Aggregate roots are the main entry points to an aggregate.
 * They maintain consistency within their boundary.
 */
import { DomainEvent } from './domain-event';
import { Entity } from './entity';

export abstract class AggregateRoot extends Entity {
  private domainEvents: DomainEvent[] = [];

  addDomainEvent(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  getDomainEvents(): DomainEvent[] {
    return [...this.domainEvents];
  }

  clearDomainEvents(): void {
    this.domainEvents = [];
  }

  abstract isValid(): boolean;
}

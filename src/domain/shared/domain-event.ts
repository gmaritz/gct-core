/**
 * Domain Event Base Class
 * 
 * All domain events should extend this class.
 * Events are immutable records of something significant that happened in the domain.
 */
export abstract class DomainEvent {
  readonly occurredAt: Date;
  readonly aggregateId: string;

  constructor(aggregateId: string, occurredAt: Date = new Date()) {
    this.aggregateId = aggregateId;
    this.occurredAt = occurredAt;
  }

  abstract getEventType(): string;
}

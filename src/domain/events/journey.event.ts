import { DomainEvent } from '../shared/domain-event';

/**
 * Event raised when a journey is created
 */
export class JourneyCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    readonly name: string,
    readonly travelerId: string,
    occurredAt?: Date
  ) {
    super(aggregateId, occurredAt);
  }

  getEventType(): string {
    return 'JourneyCreated';
  }
}

/**
 * Event raised when a journey is finalized
 */
export class JourneyFinalizedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    occurredAt?: Date
  ) {
    super(aggregateId, occurredAt);
  }

  getEventType(): string {
    return 'JourneyFinalized';
  }
}

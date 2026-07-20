import { DomainEvent } from '../shared/domain-event';

/**
 * Event raised when a reservation is created
 */
export class ReservationCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    readonly travelerId: string,
    readonly journeyId: string,
    occurredAt?: Date
  ) {
    super(aggregateId, occurredAt);
  }

  getEventType(): string {
    return 'ReservationCreated';
  }
}

/**
 * Event raised when a reservation is confirmed
 */
export class ReservationConfirmedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    readonly confirmationNumber: string,
    occurredAt?: Date
  ) {
    super(aggregateId, occurredAt);
  }

  getEventType(): string {
    return 'ReservationConfirmed';
  }
}

/**
 * Event raised when a reservation is cancelled
 */
export class ReservationCancelledEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    readonly reason: string,
    occurredAt?: Date
  ) {
    super(aggregateId, occurredAt);
  }

  getEventType(): string {
    return 'ReservationCancelled';
  }
}

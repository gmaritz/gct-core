import { DomainEvent } from '../shared/domain-event';
import { TravellerPreferences } from '../shared/traveller-preferences';

/**
 * Event raised when a traveller is created
 */
export class TravellerCreatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly email: string,
    occurredAt?: Date
  ) {
    super(aggregateId, occurredAt);
  }

  getEventType(): string {
    return 'TravellerCreated';
  }
}

/**
 * Event raised when a traveller's profile (name) is updated
 */
export class TravellerProfileUpdatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    readonly firstName: string,
    readonly lastName: string,
    occurredAt?: Date
  ) {
    super(aggregateId, occurredAt);
  }

  getEventType(): string {
    return 'TravellerProfileUpdated';
  }
}

/**
 * Event raised when a traveller's preferences are updated
 */
export class TravellerPreferencesUpdatedEvent extends DomainEvent {
  constructor(
    aggregateId: string,
    readonly preferences: TravellerPreferences,
    occurredAt?: Date
  ) {
    super(aggregateId, occurredAt);
  }

  getEventType(): string {
    return 'TravellerPreferencesUpdated';
  }
}

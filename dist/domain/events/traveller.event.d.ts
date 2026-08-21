import { DomainEvent } from '../shared/domain-event';
import { TravellerPreferences } from '../shared/traveller-preferences';
/**
 * Event raised when a traveller is created
 */
export declare class TravellerCreatedEvent extends DomainEvent {
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    constructor(aggregateId: string, firstName: string, lastName: string, email: string, occurredAt?: Date);
    getEventType(): string;
}
/**
 * Event raised when a traveller's profile (name) is updated
 */
export declare class TravellerProfileUpdatedEvent extends DomainEvent {
    readonly firstName: string;
    readonly lastName: string;
    constructor(aggregateId: string, firstName: string, lastName: string, occurredAt?: Date);
    getEventType(): string;
}
/**
 * Event raised when a traveller's preferences are updated
 */
export declare class TravellerPreferencesUpdatedEvent extends DomainEvent {
    readonly preferences: TravellerPreferences;
    constructor(aggregateId: string, preferences: TravellerPreferences, occurredAt?: Date);
    getEventType(): string;
}
//# sourceMappingURL=traveller.event.d.ts.map
import { DomainEvent } from '../shared/domain-event';
/**
 * Event raised when a journey is created
 */
export declare class JourneyCreatedEvent extends DomainEvent {
    readonly name: string;
    readonly travelerId: string;
    constructor(aggregateId: string, name: string, travelerId: string, occurredAt?: Date);
    getEventType(): string;
}
/**
 * Event raised when a journey is finalized
 */
export declare class JourneyFinalizedEvent extends DomainEvent {
    constructor(aggregateId: string, occurredAt?: Date);
    getEventType(): string;
}
//# sourceMappingURL=journey.event.d.ts.map
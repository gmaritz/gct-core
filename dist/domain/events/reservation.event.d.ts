import { DomainEvent } from '../shared/domain-event';
/**
 * Event raised when a reservation is created
 */
export declare class ReservationCreatedEvent extends DomainEvent {
    readonly travelerId: string;
    readonly journeyId: string;
    constructor(aggregateId: string, travelerId: string, journeyId: string, occurredAt?: Date);
    getEventType(): string;
}
/**
 * Event raised when a reservation is confirmed
 */
export declare class ReservationConfirmedEvent extends DomainEvent {
    readonly confirmationNumber: string;
    constructor(aggregateId: string, confirmationNumber: string, occurredAt?: Date);
    getEventType(): string;
}
/**
 * Event raised when a reservation is cancelled
 */
export declare class ReservationCancelledEvent extends DomainEvent {
    readonly reason: string;
    constructor(aggregateId: string, reason: string, occurredAt?: Date);
    getEventType(): string;
}
//# sourceMappingURL=reservation.event.d.ts.map
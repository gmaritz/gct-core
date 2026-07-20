/**
 * Domain Event Base Class
 *
 * All domain events should extend this class.
 * Events are immutable records of something significant that happened in the domain.
 */
export declare abstract class DomainEvent {
    readonly occurredAt: Date;
    readonly aggregateId: string;
    constructor(aggregateId: string, occurredAt?: Date);
    abstract getEventType(): string;
}
//# sourceMappingURL=domain-event.d.ts.map
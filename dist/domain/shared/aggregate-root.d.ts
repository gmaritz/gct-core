/**
 * Aggregate Root Base Class
 *
 * All aggregate roots should extend this class.
 * Aggregate roots are the main entry points to an aggregate.
 * They maintain consistency within their boundary.
 */
import { DomainEvent } from './domain-event';
import { Entity } from './entity';
export declare abstract class AggregateRoot extends Entity {
    private domainEvents;
    addDomainEvent(event: DomainEvent): void;
    getDomainEvents(): DomainEvent[];
    clearDomainEvents(): void;
    abstract isValid(): boolean;
}
//# sourceMappingURL=aggregate-root.d.ts.map
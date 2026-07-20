"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainEvent = void 0;
/**
 * Domain Event Base Class
 *
 * All domain events should extend this class.
 * Events are immutable records of something significant that happened in the domain.
 */
class DomainEvent {
    constructor(aggregateId, occurredAt = new Date()) {
        this.aggregateId = aggregateId;
        this.occurredAt = occurredAt;
    }
}
exports.DomainEvent = DomainEvent;
//# sourceMappingURL=domain-event.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyFinalizedEvent = exports.JourneyCreatedEvent = void 0;
const domain_event_1 = require("../shared/domain-event");
/**
 * Event raised when a journey is created
 */
class JourneyCreatedEvent extends domain_event_1.DomainEvent {
    constructor(aggregateId, name, travelerId, occurredAt) {
        super(aggregateId, occurredAt);
        this.name = name;
        this.travelerId = travelerId;
    }
    getEventType() {
        return 'JourneyCreated';
    }
}
exports.JourneyCreatedEvent = JourneyCreatedEvent;
/**
 * Event raised when a journey is finalized
 */
class JourneyFinalizedEvent extends domain_event_1.DomainEvent {
    constructor(aggregateId, occurredAt) {
        super(aggregateId, occurredAt);
    }
    getEventType() {
        return 'JourneyFinalized';
    }
}
exports.JourneyFinalizedEvent = JourneyFinalizedEvent;
//# sourceMappingURL=journey.event.js.map
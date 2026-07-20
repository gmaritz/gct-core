"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationCancelledEvent = exports.ReservationConfirmedEvent = exports.ReservationCreatedEvent = void 0;
const domain_event_1 = require("../shared/domain-event");
/**
 * Event raised when a reservation is created
 */
class ReservationCreatedEvent extends domain_event_1.DomainEvent {
    constructor(aggregateId, travelerId, journeyId, occurredAt) {
        super(aggregateId, occurredAt);
        this.travelerId = travelerId;
        this.journeyId = journeyId;
    }
    getEventType() {
        return 'ReservationCreated';
    }
}
exports.ReservationCreatedEvent = ReservationCreatedEvent;
/**
 * Event raised when a reservation is confirmed
 */
class ReservationConfirmedEvent extends domain_event_1.DomainEvent {
    constructor(aggregateId, confirmationNumber, occurredAt) {
        super(aggregateId, occurredAt);
        this.confirmationNumber = confirmationNumber;
    }
    getEventType() {
        return 'ReservationConfirmed';
    }
}
exports.ReservationConfirmedEvent = ReservationConfirmedEvent;
/**
 * Event raised when a reservation is cancelled
 */
class ReservationCancelledEvent extends domain_event_1.DomainEvent {
    constructor(aggregateId, reason, occurredAt) {
        super(aggregateId, occurredAt);
        this.reason = reason;
    }
    getEventType() {
        return 'ReservationCancelled';
    }
}
exports.ReservationCancelledEvent = ReservationCancelledEvent;
//# sourceMappingURL=reservation.event.js.map
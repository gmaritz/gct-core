"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TravellerPreferencesUpdatedEvent = exports.TravellerCreatedEvent = void 0;
const domain_event_1 = require("../shared/domain-event");
/**
 * Event raised when a traveller is created
 */
class TravellerCreatedEvent extends domain_event_1.DomainEvent {
    constructor(aggregateId, firstName, lastName, email, occurredAt) {
        super(aggregateId, occurredAt);
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
    }
    getEventType() {
        return 'TravellerCreated';
    }
}
exports.TravellerCreatedEvent = TravellerCreatedEvent;
/**
 * Event raised when a traveller's preferences are updated
 */
class TravellerPreferencesUpdatedEvent extends domain_event_1.DomainEvent {
    constructor(aggregateId, preferences, occurredAt) {
        super(aggregateId, occurredAt);
        this.preferences = preferences;
    }
    getEventType() {
        return 'TravellerPreferencesUpdated';
    }
}
exports.TravellerPreferencesUpdatedEvent = TravellerPreferencesUpdatedEvent;
//# sourceMappingURL=traveller.event.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Journey = exports.JourneyStatus = void 0;
const uuid_1 = require("uuid");
const aggregate_root_1 = require("../shared/aggregate-root");
const date_range_vo_1 = require("../value-objects/date-range.vo");
const journey_event_1 = require("../events/journey.event");
const journey_exception_1 = require("../exceptions/journey.exception");
/**
 * Journey Status enumeration
 */
var JourneyStatus;
(function (JourneyStatus) {
    JourneyStatus["PLANNING"] = "PLANNING";
    JourneyStatus["SCHEDULED"] = "SCHEDULED";
    JourneyStatus["ONGOING"] = "ONGOING";
    JourneyStatus["COMPLETED"] = "COMPLETED";
    JourneyStatus["CANCELLED"] = "CANCELLED";
})(JourneyStatus || (exports.JourneyStatus = JourneyStatus = {}));
/**
 * Journey Aggregate Root
 *
 * Represents the complete travel experience.
 * Encapsulates itinerary, bookings, and experiences.
 */
class Journey extends aggregate_root_1.AggregateRoot {
    constructor(id, journeyCode, travelerId, name, description, status, dateRange, createdAt = new Date(), updatedAt = new Date(), finalizedAt = null) {
        super(id);
        this.journeyCode = journeyCode;
        this.travelerId = travelerId;
        this.name = name;
        this.description = description;
        this.status = status;
        this.dateRange = dateRange;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.finalizedAt = finalizedAt;
    }
    static create(travelerId, name, description, startDate, endDate) {
        if (!travelerId) {
            throw new journey_exception_1.InvalidJourneyException('Traveller ID is required');
        }
        if (!name || name.trim().length === 0) {
            throw new journey_exception_1.InvalidJourneyException('Journey name is required');
        }
        const id = (0, uuid_1.v4)();
        const journeyCode = this.generateJourneyCode();
        const dateRange = date_range_vo_1.DateRange.create(startDate, endDate);
        const journey = new Journey(id, journeyCode, travelerId, name.trim(), description.trim(), JourneyStatus.PLANNING, dateRange);
        journey.addDomainEvent(new journey_event_1.JourneyCreatedEvent(id, name, travelerId));
        return journey;
    }
    static restore(id, journeyCode, travelerId, name, description, status, dateRange, createdAt, updatedAt, finalizedAt) {
        return new Journey(id, journeyCode, travelerId, name, description, status, dateRange, createdAt, updatedAt, finalizedAt);
    }
    finalize() {
        if (this.status === JourneyStatus.CANCELLED) {
            throw new journey_exception_1.InvalidJourneyException('Cannot finalize a cancelled journey');
        }
        this.status = JourneyStatus.SCHEDULED;
        this.finalizedAt = new Date();
        this.addDomainEvent(new journey_event_1.JourneyFinalizedEvent(this.id));
    }
    updateStatus(newStatus) {
        // Only allow certain transitions
        const allowedTransitions = {
            [JourneyStatus.PLANNING]: [JourneyStatus.SCHEDULED, JourneyStatus.CANCELLED],
            [JourneyStatus.SCHEDULED]: [JourneyStatus.ONGOING, JourneyStatus.CANCELLED],
            [JourneyStatus.ONGOING]: [JourneyStatus.COMPLETED, JourneyStatus.CANCELLED],
            [JourneyStatus.COMPLETED]: [],
            [JourneyStatus.CANCELLED]: [],
        };
        if (!allowedTransitions[this.status].includes(newStatus)) {
            throw new journey_exception_1.InvalidJourneyException(`Cannot transition from ${this.status} to ${newStatus}`);
        }
        this.status = newStatus;
        this.updatedAt = new Date();
    }
    getJourneyCode() {
        return this.journeyCode;
    }
    getTravelerId() {
        return this.travelerId;
    }
    getName() {
        return this.name;
    }
    getDescription() {
        return this.description;
    }
    getStatus() {
        return this.status;
    }
    getDateRange() {
        return this.dateRange;
    }
    getCreatedAt() {
        return this.createdAt;
    }
    getUpdatedAt() {
        return this.updatedAt;
    }
    getFinalizedAt() {
        return this.finalizedAt;
    }
    isValid() {
        return (this.journeyCode.length > 0 &&
            this.travelerId.length > 0 &&
            this.name.length > 0 &&
            this.status !== null &&
            this.dateRange !== null);
    }
    static generateJourneyCode() {
        const prefix = 'JRN';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }
}
exports.Journey = Journey;
//# sourceMappingURL=journey.aggregate.js.map
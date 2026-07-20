"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Traveller = void 0;
const uuid_1 = require("uuid");
const aggregate_root_1 = require("../shared/aggregate-root");
const email_address_vo_1 = require("../value-objects/email-address.vo");
const traveller_event_1 = require("../events/traveller.event");
/**
 * Traveller Aggregate Root
 *
 * Represents a long-term relationship with a traveller.
 * Encapsulates traveller identity, preferences, and history.
 */
class Traveller extends aggregate_root_1.AggregateRoot {
    constructor(id, firstName, lastName, email, preferences = {}, createdAt = new Date(), updatedAt = new Date()) {
        super(id);
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.preferences = preferences;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    static create(firstName, lastName, email) {
        if (!firstName || firstName.trim().length === 0) {
            throw new Error('First name is required');
        }
        if (!lastName || lastName.trim().length === 0) {
            throw new Error('Last name is required');
        }
        const emailVo = email_address_vo_1.EmailAddress.create(email);
        const id = (0, uuid_1.v4)();
        const traveller = new Traveller(id, firstName.trim(), lastName.trim(), emailVo);
        traveller.addDomainEvent(new traveller_event_1.TravellerCreatedEvent(id, firstName, lastName, email));
        return traveller;
    }
    static restore(id, firstName, lastName, email, preferences, createdAt, updatedAt) {
        const emailVo = email_address_vo_1.EmailAddress.create(email);
        return new Traveller(id, firstName, lastName, emailVo, preferences, createdAt, updatedAt);
    }
    getFirstName() {
        return this.firstName;
    }
    getLastName() {
        return this.lastName;
    }
    getFullName() {
        return `${this.firstName} ${this.lastName}`;
    }
    getEmail() {
        return this.email.value;
    }
    getPreferences() {
        return { ...this.preferences };
    }
    updateProfile(firstName, lastName) {
        if (!firstName || firstName.trim().length === 0) {
            throw new Error('First name is required');
        }
        if (!lastName || lastName.trim().length === 0) {
            throw new Error('Last name is required');
        }
        this.firstName = firstName.trim();
        this.lastName = lastName.trim();
        this.updatedAt = new Date();
        this.addDomainEvent(new traveller_event_1.TravellerProfileUpdatedEvent(this.id, this.firstName, this.lastName));
    }
    updatePreferences(preferences) {
        this.preferences = { ...preferences };
        this.updatedAt = new Date();
    }
    getCreatedAt() {
        return this.createdAt;
    }
    getUpdatedAt() {
        return this.updatedAt;
    }
    isValid() {
        return (this.firstName.length > 0 &&
            this.lastName.length > 0 &&
            this.email !== null);
    }
}
exports.Traveller = Traveller;
//# sourceMappingURL=traveller.aggregate.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reservation = exports.ReservationStatus = void 0;
const uuid_1 = require("uuid");
const aggregate_root_1 = require("../shared/aggregate-root");
const reservation_event_1 = require("../events/reservation.event");
const reservation_exception_1 = require("../exceptions/reservation.exception");
/**
 * Reservation Status enumeration
 */
var ReservationStatus;
(function (ReservationStatus) {
    ReservationStatus["PENDING"] = "PENDING";
    ReservationStatus["CONFIRMED"] = "CONFIRMED";
    ReservationStatus["CANCELLED"] = "CANCELLED";
    ReservationStatus["COMPLETED"] = "COMPLETED";
})(ReservationStatus || (exports.ReservationStatus = ReservationStatus = {}));
/**
 * Reservation Aggregate Root
 *
 * Represents a booking of a journey by a traveller.
 * Encapsulates reservation state and business rules.
 */
class Reservation extends aggregate_root_1.AggregateRoot {
    constructor(id, reservationNumber, travelerId, journeyId, status, totalPrice, createdAt = new Date(), confirmedAt = null, cancelledAt = null) {
        super(id);
        this.reservationNumber = reservationNumber;
        this.travelerId = travelerId;
        this.journeyId = journeyId;
        this.status = status;
        this.totalPrice = totalPrice;
        this.createdAt = createdAt;
        this.confirmedAt = confirmedAt;
        this.cancelledAt = cancelledAt;
    }
    static create(travelerId, journeyId, totalPrice) {
        if (!travelerId) {
            throw new reservation_exception_1.InvalidReservationException('Traveller ID is required');
        }
        if (!journeyId) {
            throw new reservation_exception_1.InvalidReservationException('Journey ID is required');
        }
        const id = (0, uuid_1.v4)();
        const reservationNumber = this.generateReservationNumber();
        const reservation = new Reservation(id, reservationNumber, travelerId, journeyId, ReservationStatus.PENDING, totalPrice);
        reservation.addDomainEvent(new reservation_event_1.ReservationCreatedEvent(id, travelerId, journeyId));
        return reservation;
    }
    static restore(id, reservationNumber, travelerId, journeyId, status, totalPrice, createdAt, confirmedAt, cancelledAt) {
        return new Reservation(id, reservationNumber, travelerId, journeyId, status, totalPrice, createdAt, confirmedAt, cancelledAt);
    }
    confirm() {
        if (this.status !== ReservationStatus.PENDING) {
            throw new reservation_exception_1.InvalidReservationException('Only pending reservations can be confirmed');
        }
        this.status = ReservationStatus.CONFIRMED;
        this.confirmedAt = new Date();
        this.addDomainEvent(new reservation_event_1.ReservationConfirmedEvent(this.id, this.reservationNumber));
    }
    cancel(reason) {
        if (this.status === ReservationStatus.CANCELLED) {
            throw new reservation_exception_1.ReservationCannotBeCancelledException(this.id, 'Reservation is already cancelled');
        }
        if (this.status === ReservationStatus.COMPLETED) {
            throw new reservation_exception_1.ReservationCannotBeCancelledException(this.id, 'Cannot cancel a completed reservation');
        }
        this.status = ReservationStatus.CANCELLED;
        this.cancelledAt = new Date();
        this.addDomainEvent(new reservation_event_1.ReservationCancelledEvent(this.id, reason));
    }
    getReservationNumber() {
        return this.reservationNumber;
    }
    getTravelerId() {
        return this.travelerId;
    }
    getJourneyId() {
        return this.journeyId;
    }
    getStatus() {
        return this.status;
    }
    getTotalPrice() {
        return this.totalPrice;
    }
    getCreatedAt() {
        return this.createdAt;
    }
    getConfirmedAt() {
        return this.confirmedAt;
    }
    getCancelledAt() {
        return this.cancelledAt;
    }
    isValid() {
        return (this.reservationNumber.length > 0 &&
            this.travelerId.length > 0 &&
            this.journeyId.length > 0 &&
            this.status !== null &&
            this.totalPrice !== null);
    }
    static generateReservationNumber() {
        const prefix = 'RES';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }
}
exports.Reservation = Reservation;
//# sourceMappingURL=reservation.aggregate.js.map
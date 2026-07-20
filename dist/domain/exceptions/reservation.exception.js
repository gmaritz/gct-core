"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationCannotBeCancelledException = exports.InvalidReservationException = exports.ReservationNotFoundException = void 0;
const domain_exception_1 = require("../shared/domain-exception");
/**
 * Exception thrown when a reservation cannot be found
 */
class ReservationNotFoundException extends domain_exception_1.DomainException {
    constructor(reservationId) {
        super(`Reservation with ID ${reservationId} not found`);
    }
}
exports.ReservationNotFoundException = ReservationNotFoundException;
/**
 * Exception thrown when reservation data is invalid
 */
class InvalidReservationException extends domain_exception_1.DomainException {
    constructor(message) {
        super(`Invalid reservation data: ${message}`);
    }
}
exports.InvalidReservationException = InvalidReservationException;
/**
 * Exception thrown when a reservation cannot be cancelled
 */
class ReservationCannotBeCancelledException extends domain_exception_1.DomainException {
    constructor(reservationId, reason) {
        super(`Reservation ${reservationId} cannot be cancelled: ${reason}`);
    }
}
exports.ReservationCannotBeCancelledException = ReservationCannotBeCancelledException;
//# sourceMappingURL=reservation.exception.js.map
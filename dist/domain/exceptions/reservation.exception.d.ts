import { DomainException } from '../shared/domain-exception';
/**
 * Exception thrown when a reservation cannot be found
 */
export declare class ReservationNotFoundException extends DomainException {
    constructor(reservationId: string);
}
/**
 * Exception thrown when reservation data is invalid
 */
export declare class InvalidReservationException extends DomainException {
    constructor(message: string);
}
/**
 * Exception thrown when a reservation cannot be cancelled
 */
export declare class ReservationCannotBeCancelledException extends DomainException {
    constructor(reservationId: string, reason: string);
}
//# sourceMappingURL=reservation.exception.d.ts.map
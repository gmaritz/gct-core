import { DomainException } from '../shared/domain-exception';

/**
 * Exception thrown when a reservation cannot be found
 */
export class ReservationNotFoundException extends DomainException {
  constructor(reservationId: string) {
    super(`Reservation with ID ${reservationId} not found`);
  }
}

/**
 * Exception thrown when reservation data is invalid
 */
export class InvalidReservationException extends DomainException {
  constructor(message: string) {
    super(`Invalid reservation data: ${message}`);
  }
}

/**
 * Exception thrown when a reservation cannot be cancelled
 */
export class ReservationCannotBeCancelledException extends DomainException {
  constructor(reservationId: string, reason: string) {
    super(`Reservation ${reservationId} cannot be cancelled: ${reason}`);
  }
}

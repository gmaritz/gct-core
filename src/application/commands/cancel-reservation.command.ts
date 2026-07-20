/**
 * Cancel Reservation Command
 * 
 * Command to cancel an existing reservation.
 */
export class CancelReservationCommand {
  constructor(
    readonly reservationId: string,
    readonly reason: string
  ) {}
}

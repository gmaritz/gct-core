/**
 * Confirm Reservation Command
 * 
 * Command to confirm a pending reservation.
 */
export class ConfirmReservationCommand {
  constructor(readonly reservationId: string) {}
}

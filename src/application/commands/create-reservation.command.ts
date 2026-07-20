/**
 * Create Reservation Command
 * 
 * Command to initiate the creation of a new reservation.
 */
export class CreateReservationCommand {
  constructor(
    readonly travelerId: string,
    readonly journeyId: string,
    readonly amount: number,
    readonly currency: string
  ) {}
}

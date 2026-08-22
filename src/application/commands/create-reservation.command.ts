/**
 * Create Reservation Command
 * 
 * Command to initiate the creation of a new reservation.
 */
export class CreateReservationCommand {
  constructor(
    readonly customerId: string,
    readonly travelerId: string,
    readonly journeyId: string,
    readonly amount: number,
    readonly currency: string,
    readonly bookingStartDate: Date,
    readonly bookingEndDate: Date,
    readonly bookingStatus?: string,
  ) {}
}

/**
 * Create Reservation Command
 *
 * Command to initiate the creation of a new reservation.
 */
export declare class CreateReservationCommand {
    readonly customerId: string;
    readonly travelerId: string;
    readonly journeyId: string;
    readonly amount: number;
    readonly currency: string;
    readonly bookingStartDate: Date;
    readonly bookingEndDate: Date;
    readonly bookingStatus?: string | undefined;
    constructor(customerId: string, travelerId: string, journeyId: string, amount: number, currency: string, bookingStartDate: Date, bookingEndDate: Date, bookingStatus?: string | undefined);
}
//# sourceMappingURL=create-reservation.command.d.ts.map
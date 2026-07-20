/**
 * Create Reservation Command
 *
 * Command to initiate the creation of a new reservation.
 */
export declare class CreateReservationCommand {
    readonly travelerId: string;
    readonly journeyId: string;
    readonly amount: number;
    readonly currency: string;
    constructor(travelerId: string, journeyId: string, amount: number, currency: string);
}
//# sourceMappingURL=create-reservation.command.d.ts.map
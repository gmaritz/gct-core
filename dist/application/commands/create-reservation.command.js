"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateReservationCommand = void 0;
/**
 * Create Reservation Command
 *
 * Command to initiate the creation of a new reservation.
 */
class CreateReservationCommand {
    constructor(travelerId, journeyId, amount, currency) {
        this.travelerId = travelerId;
        this.journeyId = journeyId;
        this.amount = amount;
        this.currency = currency;
    }
}
exports.CreateReservationCommand = CreateReservationCommand;
//# sourceMappingURL=create-reservation.command.js.map
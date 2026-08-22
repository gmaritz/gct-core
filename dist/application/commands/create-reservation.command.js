"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateReservationCommand = void 0;
/**
 * Create Reservation Command
 *
 * Command to initiate the creation of a new reservation.
 */
class CreateReservationCommand {
    constructor(customerId, travelerId, journeyId, amount, currency, bookingStartDate, bookingEndDate, bookingStatus) {
        this.customerId = customerId;
        this.travelerId = travelerId;
        this.journeyId = journeyId;
        this.amount = amount;
        this.currency = currency;
        this.bookingStartDate = bookingStartDate;
        this.bookingEndDate = bookingEndDate;
        this.bookingStatus = bookingStatus;
    }
}
exports.CreateReservationCommand = CreateReservationCommand;
//# sourceMappingURL=create-reservation.command.js.map
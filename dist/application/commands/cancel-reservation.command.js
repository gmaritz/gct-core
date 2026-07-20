"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelReservationCommand = void 0;
/**
 * Cancel Reservation Command
 *
 * Command to cancel an existing reservation.
 */
class CancelReservationCommand {
    constructor(reservationId, reason) {
        this.reservationId = reservationId;
        this.reason = reason;
    }
}
exports.CancelReservationCommand = CancelReservationCommand;
//# sourceMappingURL=cancel-reservation.command.js.map
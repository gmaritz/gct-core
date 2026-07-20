"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmReservationHandler = void 0;
/**
 * ConfirmReservationHandler
 *
 * Handles the ConfirmReservationCommand by delegating to ConfirmReservationService.
 */
class ConfirmReservationHandler {
    constructor(service) {
        this.service = service;
    }
    async handle(command) {
        return this.service.execute(command);
    }
}
exports.ConfirmReservationHandler = ConfirmReservationHandler;
//# sourceMappingURL=confirm-reservation.handler.js.map
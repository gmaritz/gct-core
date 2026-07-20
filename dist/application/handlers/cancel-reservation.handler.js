"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelReservationHandler = void 0;
/**
 * CancelReservationHandler
 *
 * Handles the CancelReservationCommand by delegating to CancelReservationService.
 */
class CancelReservationHandler {
    constructor(service) {
        this.service = service;
    }
    async handle(command) {
        return this.service.execute(command);
    }
}
exports.CancelReservationHandler = CancelReservationHandler;
//# sourceMappingURL=cancel-reservation.handler.js.map
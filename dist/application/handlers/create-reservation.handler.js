"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateReservationHandler = void 0;
/**
 * CreateReservationHandler
 *
 * Handles the CreateReservationCommand by delegating to CreateReservationService.
 */
class CreateReservationHandler {
    constructor(service) {
        this.service = service;
    }
    async handle(command) {
        return this.service.execute(command);
    }
}
exports.CreateReservationHandler = CreateReservationHandler;
//# sourceMappingURL=create-reservation.handler.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindReservationHandler = void 0;
/**
 * FindReservationHandler
 *
 * Handles the FindReservationQuery by delegating to RetrieveReservationService.
 */
class FindReservationHandler {
    constructor(service) {
        this.service = service;
    }
    async handle(query) {
        return this.service.execute(query);
    }
}
exports.FindReservationHandler = FindReservationHandler;
//# sourceMappingURL=find-reservation.handler.js.map
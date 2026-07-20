"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTravellerHandler = void 0;
/**
 * UpdateTravellerHandler
 *
 * Handles the UpdateTravellerCommand by delegating to UpdateTravellerService.
 */
class UpdateTravellerHandler {
    constructor(service) {
        this.service = service;
    }
    async handle(command) {
        return this.service.execute(command);
    }
}
exports.UpdateTravellerHandler = UpdateTravellerHandler;
//# sourceMappingURL=update-traveller.handler.js.map
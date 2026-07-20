"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTravellerHandler = void 0;
/**
 * CreateTravellerHandler
 *
 * Handles the CreateTravellerCommand by delegating to CreateTravellerService.
 */
class CreateTravellerHandler {
    constructor(service) {
        this.service = service;
    }
    async handle(command) {
        return this.service.execute(command);
    }
}
exports.CreateTravellerHandler = CreateTravellerHandler;
//# sourceMappingURL=create-traveller.handler.js.map
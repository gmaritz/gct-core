"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateJourneyHandler = void 0;
/**
 * CreateJourneyHandler
 *
 * Handles the CreateJourneyCommand by delegating to CreateJourneyService.
 */
class CreateJourneyHandler {
    constructor(service) {
        this.service = service;
    }
    async handle(command) {
        return this.service.execute(command);
    }
}
exports.CreateJourneyHandler = CreateJourneyHandler;
//# sourceMappingURL=create-journey.handler.js.map
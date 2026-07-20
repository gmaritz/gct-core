"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompleteJourneyHandler = void 0;
/**
 * CompleteJourneyHandler
 *
 * Handles the CompleteJourneyCommand by delegating to CompleteJourneyService.
 */
class CompleteJourneyHandler {
    constructor(service) {
        this.service = service;
    }
    async handle(command) {
        return this.service.execute(command);
    }
}
exports.CompleteJourneyHandler = CompleteJourneyHandler;
//# sourceMappingURL=complete-journey.handler.js.map
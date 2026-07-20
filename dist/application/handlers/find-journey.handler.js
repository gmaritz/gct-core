"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindJourneyHandler = void 0;
/**
 * FindJourneyHandler
 *
 * Handles the FindJourneyQuery by delegating to RetrieveJourneyService.
 */
class FindJourneyHandler {
    constructor(service) {
        this.service = service;
    }
    async handle(query) {
        return this.service.execute(query);
    }
}
exports.FindJourneyHandler = FindJourneyHandler;
//# sourceMappingURL=find-journey.handler.js.map
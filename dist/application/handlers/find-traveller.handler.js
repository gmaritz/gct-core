"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindTravellerHandler = void 0;
/**
 * FindTravellerHandler
 *
 * Handles the FindTravellerQuery by delegating to RetrieveTravellerService.
 */
class FindTravellerHandler {
    constructor(service) {
        this.service = service;
    }
    async handle(query) {
        return this.service.execute(query);
    }
}
exports.FindTravellerHandler = FindTravellerHandler;
//# sourceMappingURL=find-traveller.handler.js.map
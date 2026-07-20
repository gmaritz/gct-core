"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateJourneyCommand = void 0;
/**
 * Create Journey Command
 *
 * Command to create a new journey.
 */
class CreateJourneyCommand {
    constructor(travelerId, name, description, startDate, endDate) {
        this.travelerId = travelerId;
        this.name = name;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
    }
}
exports.CreateJourneyCommand = CreateJourneyCommand;
//# sourceMappingURL=create-journey.command.js.map
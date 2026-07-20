"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTravellerCommand = void 0;
/**
 * Update Traveller Command
 *
 * Command to update an existing traveller's profile.
 */
class UpdateTravellerCommand {
    constructor(travelerId, firstName, lastName) {
        this.travelerId = travelerId;
        this.firstName = firstName;
        this.lastName = lastName;
    }
}
exports.UpdateTravellerCommand = UpdateTravellerCommand;
//# sourceMappingURL=update-traveller.command.js.map
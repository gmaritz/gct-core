"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTravellerCommand = void 0;
/**
 * Create Traveller Command
 *
 * Command to initiate the creation of a new traveller.
 */
class CreateTravellerCommand {
    constructor(customerId, firstName, lastName, email) {
        this.customerId = customerId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
    }
}
exports.CreateTravellerCommand = CreateTravellerCommand;
//# sourceMappingURL=create-traveller.command.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidTravellerException = exports.TravellerNotFoundException = void 0;
const domain_exception_1 = require("../shared/domain-exception");
/**
 * Exception thrown when a traveller cannot be found
 */
class TravellerNotFoundException extends domain_exception_1.DomainException {
    constructor(travelerId) {
        super(`Traveller with ID ${travelerId} not found`);
    }
}
exports.TravellerNotFoundException = TravellerNotFoundException;
/**
 * Exception thrown when traveller data is invalid
 */
class InvalidTravellerException extends domain_exception_1.DomainException {
    constructor(message) {
        super(`Invalid traveller data: ${message}`);
    }
}
exports.InvalidTravellerException = InvalidTravellerException;
//# sourceMappingURL=traveller.exception.js.map
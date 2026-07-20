"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidJourneyException = exports.JourneyNotFoundException = void 0;
const domain_exception_1 = require("../shared/domain-exception");
/**
 * Exception thrown when a journey cannot be found
 */
class JourneyNotFoundException extends domain_exception_1.DomainException {
    constructor(journeyId) {
        super(`Journey with ID ${journeyId} not found`);
    }
}
exports.JourneyNotFoundException = JourneyNotFoundException;
/**
 * Exception thrown when journey data is invalid
 */
class InvalidJourneyException extends domain_exception_1.DomainException {
    constructor(message) {
        super(`Invalid journey data: ${message}`);
    }
}
exports.InvalidJourneyException = InvalidJourneyException;
//# sourceMappingURL=journey.exception.js.map
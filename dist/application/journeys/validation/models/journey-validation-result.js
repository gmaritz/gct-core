"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJourneyValidationResult = createJourneyValidationResult;
function createJourneyValidationResult(errors) {
    return Object.freeze({
        valid: errors.length === 0,
        errors: Object.freeze([...errors]),
    });
}
//# sourceMappingURL=journey-validation-result.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPricingValidationError = createPricingValidationError;
function createPricingValidationError(error) {
    return Object.freeze({
        code: error.code,
        stage: error.stage,
        message: error.message,
        critical: error.critical,
    });
}
//# sourceMappingURL=pricing-validation-error.js.map
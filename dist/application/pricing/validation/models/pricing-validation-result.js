"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPricingValidationResult = createPricingValidationResult;
const pricing_validation_error_1 = require("./pricing-validation-error");
function createPricingValidationResult(input) {
    const errors = Object.freeze([...(input.errors ?? []).map(pricing_validation_error_1.createPricingValidationError)]);
    const warnings = Object.freeze([...(input.warnings ?? [])]);
    return Object.freeze({
        valid: errors.length === 0,
        stage: input.stage,
        errors,
        warnings,
        metadata: Object.freeze({
            validatedAt: new Date(input.metadata.validatedAt.getTime()),
            version: input.metadata.version,
            source: input.metadata.source,
        }),
    });
}
//# sourceMappingURL=pricing-validation-result.js.map
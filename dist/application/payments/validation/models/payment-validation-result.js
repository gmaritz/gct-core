"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentValidationResult = createPaymentValidationResult;
const payment_validation_error_1 = require("./payment-validation-error");
function createPaymentValidationResult(input) {
    const errors = Object.freeze([...(input.errors ?? []).map(payment_validation_error_1.createPaymentValidationError)]);
    const warnings = Object.freeze([...(input.warnings ?? [])]);
    return Object.freeze({
        success: errors.length === 0,
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
//# sourceMappingURL=payment-validation-result.js.map
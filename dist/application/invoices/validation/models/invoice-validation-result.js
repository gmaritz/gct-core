"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceValidationResult = createInvoiceValidationResult;
const invoice_validation_error_1 = require("./invoice-validation-error");
function createInvoiceValidationResult(input) {
    const errors = Object.freeze([...(input.errors ?? []).map(invoice_validation_error_1.createInvoiceValidationError)]);
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
//# sourceMappingURL=invoice-validation-result.js.map
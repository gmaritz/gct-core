"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceValidationError = createInvoiceValidationError;
function createInvoiceValidationError(error) {
    return Object.freeze({
        stage: error.stage,
        code: error.code,
        message: error.message,
        severity: error.severity,
    });
}
//# sourceMappingURL=invoice-validation-error.js.map
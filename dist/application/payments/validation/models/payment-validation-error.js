"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentValidationError = createPaymentValidationError;
function createPaymentValidationError(error) {
    return Object.freeze({
        stage: error.stage,
        code: error.code,
        message: error.message,
        severity: error.severity,
    });
}
//# sourceMappingURL=payment-validation-error.js.map
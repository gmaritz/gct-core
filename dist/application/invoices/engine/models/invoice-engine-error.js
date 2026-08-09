"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceEngineErrorCode = void 0;
exports.createInvoiceEngineError = createInvoiceEngineError;
var InvoiceEngineErrorCode;
(function (InvoiceEngineErrorCode) {
    InvoiceEngineErrorCode["VALIDATION_FAILED"] = "VALIDATION_FAILED";
    InvoiceEngineErrorCode["POLICY_DENIED"] = "POLICY_DENIED";
    InvoiceEngineErrorCode["POLICY_ACTION_REQUIRED"] = "POLICY_ACTION_REQUIRED";
    InvoiceEngineErrorCode["MISSING_INVOICE"] = "MISSING_INVOICE";
    InvoiceEngineErrorCode["INVALID_OPERATION"] = "INVALID_OPERATION";
    InvoiceEngineErrorCode["INVALID_OPERATION_INPUT"] = "INVALID_OPERATION_INPUT";
    InvoiceEngineErrorCode["CALCULATION_ERROR"] = "CALCULATION_ERROR";
    InvoiceEngineErrorCode["DUPLICATE_PAYMENT_ALLOCATION"] = "DUPLICATE_PAYMENT_ALLOCATION";
    InvoiceEngineErrorCode["CURRENCY_MISMATCH"] = "CURRENCY_MISMATCH";
})(InvoiceEngineErrorCode || (exports.InvoiceEngineErrorCode = InvoiceEngineErrorCode = {}));
function createInvoiceEngineError(error) {
    return Object.freeze({
        code: error.code,
        message: error.message,
    });
}
//# sourceMappingURL=invoice-engine-error.js.map
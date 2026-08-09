"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicePresentationErrorCode = void 0;
exports.createInvoicePresentationError = createInvoicePresentationError;
var InvoicePresentationErrorCode;
(function (InvoicePresentationErrorCode) {
    InvoicePresentationErrorCode["MISSING_INPUT"] = "MISSING_INPUT";
    InvoicePresentationErrorCode["MISSING_INVOICE"] = "MISSING_INVOICE";
    InvoicePresentationErrorCode["ENGINE_RESULT_FAILED"] = "ENGINE_RESULT_FAILED";
})(InvoicePresentationErrorCode || (exports.InvoicePresentationErrorCode = InvoicePresentationErrorCode = {}));
function createInvoicePresentationError(error) {
    return Object.freeze({
        code: error.code,
        message: error.message,
    });
}
//# sourceMappingURL=invoice-presentation-error.js.map
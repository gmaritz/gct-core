"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceIntegrationErrorCode = void 0;
exports.createInvoiceIntegrationError = createInvoiceIntegrationError;
var InvoiceIntegrationErrorCode;
(function (InvoiceIntegrationErrorCode) {
    InvoiceIntegrationErrorCode["CONFIGURATION_ERROR"] = "CONFIGURATION_ERROR";
    InvoiceIntegrationErrorCode["AUTHENTICATION_ERROR"] = "AUTHENTICATION_ERROR";
    InvoiceIntegrationErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    InvoiceIntegrationErrorCode["PROVIDER_REJECTION"] = "PROVIDER_REJECTION";
    InvoiceIntegrationErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    InvoiceIntegrationErrorCode["TIMEOUT"] = "TIMEOUT";
    InvoiceIntegrationErrorCode["RATE_LIMITED"] = "RATE_LIMITED";
    InvoiceIntegrationErrorCode["DUPLICATE_REQUEST"] = "DUPLICATE_REQUEST";
    InvoiceIntegrationErrorCode["UNKNOWN_EXTERNAL_ERROR"] = "UNKNOWN_EXTERNAL_ERROR";
})(InvoiceIntegrationErrorCode || (exports.InvoiceIntegrationErrorCode = InvoiceIntegrationErrorCode = {}));
function createInvoiceIntegrationError(error) {
    return Object.freeze({
        code: error.code,
        message: error.message,
        retryable: error.retryable,
        providerCode: error.providerCode,
    });
}
//# sourceMappingURL=invoice-integration-error.js.map
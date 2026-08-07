"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentValidationErrorCode = void 0;
var PaymentValidationErrorCode;
(function (PaymentValidationErrorCode) {
    PaymentValidationErrorCode["MISSING_REQUEST"] = "MISSING_REQUEST";
    PaymentValidationErrorCode["MISSING_PAYMENT_IDENTIFIER"] = "MISSING_PAYMENT_IDENTIFIER";
    PaymentValidationErrorCode["MISSING_PAYMENT_METHOD"] = "MISSING_PAYMENT_METHOD";
    PaymentValidationErrorCode["MISSING_CURRENCY"] = "MISSING_CURRENCY";
    PaymentValidationErrorCode["MISSING_RESERVATION_REFERENCE"] = "MISSING_RESERVATION_REFERENCE";
    PaymentValidationErrorCode["MISSING_RESERVATION"] = "MISSING_RESERVATION";
    PaymentValidationErrorCode["RESERVATION_NOT_PAYABLE"] = "RESERVATION_NOT_PAYABLE";
    PaymentValidationErrorCode["RESERVATION_CANCELLED"] = "RESERVATION_CANCELLED";
    PaymentValidationErrorCode["MISSING_PRICING_SNAPSHOT"] = "MISSING_PRICING_SNAPSHOT";
    PaymentValidationErrorCode["INVALID_PRICING_TOTAL"] = "INVALID_PRICING_TOTAL";
    PaymentValidationErrorCode["INVALID_PAYABLE_AMOUNT"] = "INVALID_PAYABLE_AMOUNT";
    PaymentValidationErrorCode["CURRENCY_MISMATCH"] = "CURRENCY_MISMATCH";
    PaymentValidationErrorCode["UNSUPPORTED_PAYMENT_METHOD"] = "UNSUPPORTED_PAYMENT_METHOD";
    PaymentValidationErrorCode["UNSUPPORTED_CURRENCY"] = "UNSUPPORTED_CURRENCY";
    PaymentValidationErrorCode["AMOUNT_INCONSISTENT"] = "AMOUNT_INCONSISTENT";
    PaymentValidationErrorCode["INVALID_SETTLEMENT_METADATA"] = "INVALID_SETTLEMENT_METADATA";
    PaymentValidationErrorCode["INVALID_PAYMENT_LIFECYCLE_STATE"] = "INVALID_PAYMENT_LIFECYCLE_STATE";
    PaymentValidationErrorCode["INCOMPLETE_GATEWAY_CONTEXT"] = "INCOMPLETE_GATEWAY_CONTEXT";
    PaymentValidationErrorCode["MISSING_PROVIDER_REFERENCE"] = "MISSING_PROVIDER_REFERENCE";
    PaymentValidationErrorCode["MISSING_CORRELATION_IDENTIFIERS"] = "MISSING_CORRELATION_IDENTIFIERS";
    PaymentValidationErrorCode["MISSING_PAYMENT_CONTEXT"] = "MISSING_PAYMENT_CONTEXT";
})(PaymentValidationErrorCode || (exports.PaymentValidationErrorCode = PaymentValidationErrorCode = {}));
//# sourceMappingURL=payment-validation-error-code.js.map
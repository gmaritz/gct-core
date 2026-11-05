"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentAttemptNotificationConflictError = exports.PaymentAttemptNotFoundError = void 0;
class PaymentAttemptNotFoundError extends Error {
    constructor() {
        super("Payment attempt was not found.");
        this.name = "PaymentAttemptNotFoundError";
    }
}
exports.PaymentAttemptNotFoundError = PaymentAttemptNotFoundError;
class PaymentAttemptNotificationConflictError extends Error {
    constructor(message = "Payment notification conflicts with the persisted attempt.") {
        super(message);
        this.name = "PaymentAttemptNotificationConflictError";
    }
}
exports.PaymentAttemptNotificationConflictError = PaymentAttemptNotificationConflictError;
//# sourceMappingURL=payment-attempt.js.map
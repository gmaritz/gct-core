"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentEventType = void 0;
var PaymentEventType;
(function (PaymentEventType) {
    PaymentEventType["PAYMENT_CREATED"] = "PAYMENT_CREATED";
    PaymentEventType["AUTHORIZATION_REQUESTED"] = "AUTHORIZATION_REQUESTED";
    PaymentEventType["AUTHORIZATION_APPROVED"] = "AUTHORIZATION_APPROVED";
    PaymentEventType["AUTHORIZATION_DECLINED"] = "AUTHORIZATION_DECLINED";
    PaymentEventType["CAPTURE_REQUESTED"] = "CAPTURE_REQUESTED";
    PaymentEventType["CAPTURE_COMPLETED"] = "CAPTURE_COMPLETED";
    PaymentEventType["SETTLEMENT_COMPLETED"] = "SETTLEMENT_COMPLETED";
    PaymentEventType["REFUND_REQUESTED"] = "REFUND_REQUESTED";
    PaymentEventType["REFUND_COMPLETED"] = "REFUND_COMPLETED";
})(PaymentEventType || (exports.PaymentEventType = PaymentEventType = {}));
//# sourceMappingURL=payment-event-type.js.map
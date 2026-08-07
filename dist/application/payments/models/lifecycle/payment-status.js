"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentStatus = void 0;
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["CREATED"] = "CREATED";
    PaymentStatus["AUTHORIZATION_REQUESTED"] = "AUTHORIZATION_REQUESTED";
    PaymentStatus["AUTHORIZED"] = "AUTHORIZED";
    PaymentStatus["AUTHORIZATION_FAILED"] = "AUTHORIZATION_FAILED";
    PaymentStatus["CAPTURE_REQUESTED"] = "CAPTURE_REQUESTED";
    PaymentStatus["CAPTURED"] = "CAPTURED";
    PaymentStatus["SETTLEMENT_REQUESTED"] = "SETTLEMENT_REQUESTED";
    PaymentStatus["SETTLED"] = "SETTLED";
    PaymentStatus["REFUND_REQUESTED"] = "REFUND_REQUESTED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
    PaymentStatus["CANCELLED"] = "CANCELLED";
    PaymentStatus["COMPLETED"] = "COMPLETED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
//# sourceMappingURL=payment-status.js.map
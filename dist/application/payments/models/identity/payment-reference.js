"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentReference = createPaymentReference;
function createPaymentReference(reference) {
    return Object.freeze({
        paymentId: reference.paymentId,
        reservationId: reference.reservationId,
        quotationNumber: reference.quotationNumber,
    });
}
//# sourceMappingURL=payment-reference.js.map
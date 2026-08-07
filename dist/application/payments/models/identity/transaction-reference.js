"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransactionReference = createTransactionReference;
function createTransactionReference(reference) {
    return Object.freeze({
        transactionId: reference.transactionId,
        providerCorrelationId: reference.providerCorrelationId,
        customerReference: reference.customerReference,
    });
}
//# sourceMappingURL=transaction-reference.js.map
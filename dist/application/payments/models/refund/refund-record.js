"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRefundRecord = createRefundRecord;
const method_1 = require("../method");
function createRefundRecord(record) {
    return Object.freeze({
        refundId: record.refundId,
        requestedAt: new Date(record.requestedAt.getTime()),
        refundedAt: typeof record.refundedAt === "undefined" ? undefined : new Date(record.refundedAt.getTime()),
        amount: record.amount,
        currency: record.currency,
        reason: record.reason,
        status: record.status,
        providerReference: (0, method_1.createPaymentProviderReference)(record.providerReference),
    });
}
//# sourceMappingURL=refund-record.js.map
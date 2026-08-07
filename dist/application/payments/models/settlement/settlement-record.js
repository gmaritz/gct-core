"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSettlementRecord = createSettlementRecord;
const settlement_reference_1 = require("./settlement-reference");
function createSettlementRecord(record) {
    return Object.freeze({
        reference: (0, settlement_reference_1.createSettlementReference)(record.reference),
        settledAt: new Date(record.settledAt.getTime()),
        amount: record.amount,
        currency: record.currency,
        status: record.status,
    });
}
//# sourceMappingURL=settlement-record.js.map
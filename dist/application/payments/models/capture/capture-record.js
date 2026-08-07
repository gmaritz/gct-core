"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCaptureRecord = createCaptureRecord;
const method_1 = require("../method");
function createCaptureRecord(record) {
    return Object.freeze({
        captureId: record.captureId,
        capturedAt: new Date(record.capturedAt.getTime()),
        amount: record.amount,
        currency: record.currency,
        providerReference: (0, method_1.createPaymentProviderReference)(record.providerReference),
        status: record.status,
    });
}
//# sourceMappingURL=capture-record.js.map
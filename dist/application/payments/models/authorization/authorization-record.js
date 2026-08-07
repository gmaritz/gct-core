"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthorizationRecord = createAuthorizationRecord;
const method_1 = require("../method");
function createAuthorizationRecord(record) {
    return Object.freeze({
        authorizationId: record.authorizationId,
        authorizedAt: new Date(record.authorizedAt.getTime()),
        amount: record.amount,
        currency: record.currency,
        providerReference: (0, method_1.createPaymentProviderReference)(record.providerReference),
        status: record.status,
    });
}
//# sourceMappingURL=authorization-record.js.map
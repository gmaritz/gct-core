"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSettlementReference = createSettlementReference;
const method_1 = require("../method");
function createSettlementReference(reference) {
    return Object.freeze({
        settlementId: reference.settlementId,
        batchReference: reference.batchReference,
        providerReference: (0, method_1.createPaymentProviderReference)(reference.providerReference),
    });
}
//# sourceMappingURL=settlement-reference.js.map
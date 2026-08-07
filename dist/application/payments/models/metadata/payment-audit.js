"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentAudit = createPaymentAudit;
function createPaymentAudit(audit) {
    return Object.freeze({
        correlationId: audit.correlationId,
        requestId: audit.requestId,
        traceId: audit.traceId,
        createdBy: audit.createdBy,
        updatedBy: audit.updatedBy,
    });
}
//# sourceMappingURL=payment-audit.js.map
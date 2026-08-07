"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentMetadata = createPaymentMetadata;
const payment_audit_1 = require("./payment-audit");
function createPaymentMetadata(metadata) {
    return Object.freeze({
        createdAt: new Date(metadata.createdAt.getTime()),
        updatedAt: new Date(metadata.updatedAt.getTime()),
        version: metadata.version,
        source: metadata.source,
        audit: metadata.audit ? (0, payment_audit_1.createPaymentAudit)(metadata.audit) : undefined,
    });
}
//# sourceMappingURL=payment-metadata.js.map
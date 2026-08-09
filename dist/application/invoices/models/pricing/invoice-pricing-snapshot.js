"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoicePricingSnapshot = createInvoicePricingSnapshot;
function createInvoicePricingSnapshot(snapshot) {
    return Object.freeze({
        snapshotId: snapshot.snapshotId,
        pricingId: snapshot.pricingId,
        capturedAt: new Date(snapshot.capturedAt.getTime()),
        version: snapshot.version,
        currency: snapshot.currency,
        totalAmount: snapshot.totalAmount,
    });
}
//# sourceMappingURL=invoice-pricing-snapshot.js.map
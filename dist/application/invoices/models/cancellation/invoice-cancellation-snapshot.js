"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceCancellationSnapshot = createInvoiceCancellationSnapshot;
function createInvoiceCancellationSnapshot(snapshot) {
    return Object.freeze({
        policyReference: snapshot.policyReference,
        policyVersion: snapshot.policyVersion,
        effectiveFrom: typeof snapshot.effectiveFrom === "undefined" ? undefined : new Date(snapshot.effectiveFrom.getTime()),
        effectiveTo: typeof snapshot.effectiveTo === "undefined" ? undefined : new Date(snapshot.effectiveTo.getTime()),
        cancellationDate: new Date(snapshot.cancellationDate.getTime()),
        cancellationCharge: snapshot.cancellationCharge,
        refundableAmount: snapshot.refundableAmount,
    });
}
//# sourceMappingURL=invoice-cancellation-snapshot.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensurePresent = ensurePresent;
exports.resolveMetadata = resolveMetadata;
exports.toInvoiceComposition = toInvoiceComposition;
function ensurePresent(value, message) {
    if (value === null || typeof value === "undefined") {
        throw new Error(message);
    }
    return value;
}
function resolveMetadata(metadata) {
    const now = new Date();
    return {
        createdAt: new Date(metadata.createdAt.getTime()),
        updatedAt: now,
        version: metadata.version,
    };
}
function toInvoiceComposition(invoice) {
    return {
        identity: invoice.identity,
        reservationReference: invoice.reservationReference,
        customerReference: invoice.customerReference,
        quoteReference: invoice.quoteReference,
        pricingSnapshot: invoice.pricingSnapshot,
        status: invoice.status,
        financialObligation: invoice.financialObligation,
        depositRequirement: invoice.depositRequirement,
        paymentAllocations: invoice.paymentAllocations,
        amountPaid: invoice.amountPaid,
        balanceDue: invoice.balanceDue,
        dueDate: invoice.dueDate,
        adjustments: invoice.adjustments,
        cancellationSnapshot: invoice.cancellationSnapshot,
        refundableAmount: invoice.refundableAmount,
        externalReferences: invoice.externalReferences,
        metadata: invoice.metadata,
    };
}
//# sourceMappingURL=operation-support.js.map
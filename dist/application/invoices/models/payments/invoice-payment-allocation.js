"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoicePaymentAllocation = createInvoicePaymentAllocation;
function createInvoicePaymentAllocation(allocation) {
    return Object.freeze({
        paymentId: allocation.paymentId,
        allocatedAmount: allocation.allocatedAmount,
        allocatedAt: new Date(allocation.allocatedAt.getTime()),
        externalReference: allocation.externalReference,
    });
}
//# sourceMappingURL=invoice-payment-allocation.js.map
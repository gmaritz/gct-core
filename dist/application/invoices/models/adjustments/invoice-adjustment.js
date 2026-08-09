"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceAdjustment = createInvoiceAdjustment;
function createInvoiceAdjustment(adjustment) {
    return Object.freeze({
        id: adjustment.id,
        type: adjustment.type,
        amount: adjustment.amount,
        reason: adjustment.reason,
        appliedAt: new Date(adjustment.appliedAt.getTime()),
    });
}
//# sourceMappingURL=invoice-adjustment.js.map
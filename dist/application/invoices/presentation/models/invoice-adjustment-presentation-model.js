"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceAdjustmentPresentationModel = createInvoiceAdjustmentPresentationModel;
function createInvoiceAdjustmentPresentationModel(model) {
    return Object.freeze({
        id: model.id,
        type: model.type,
        amount: model.amount,
        amountDisplay: model.amountDisplay,
        reason: model.reason,
        appliedAt: new Date(model.appliedAt.getTime()),
        appliedAtDisplay: model.appliedAtDisplay,
    });
}
//# sourceMappingURL=invoice-adjustment-presentation-model.js.map
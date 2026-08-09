"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoicePaymentPresentationModel = createInvoicePaymentPresentationModel;
function createInvoicePaymentPresentationModel(model) {
    return Object.freeze({
        paymentId: model.paymentId,
        allocatedAmount: model.allocatedAmount,
        allocatedAmountDisplay: model.allocatedAmountDisplay,
        allocatedAt: new Date(model.allocatedAt.getTime()),
        allocatedAtDisplay: model.allocatedAtDisplay,
        externalReference: model.externalReference,
    });
}
//# sourceMappingURL=invoice-payment-presentation-model.js.map
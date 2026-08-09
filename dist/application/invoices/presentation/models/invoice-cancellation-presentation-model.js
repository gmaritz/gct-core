"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceCancellationPresentationModel = createInvoiceCancellationPresentationModel;
function createInvoiceCancellationPresentationModel(model) {
    return Object.freeze({
        policyReference: model.policyReference,
        policyVersion: model.policyVersion,
        cancellationDate: new Date(model.cancellationDate.getTime()),
        cancellationDateDisplay: model.cancellationDateDisplay,
        cancellationCharge: model.cancellationCharge,
        cancellationChargeDisplay: model.cancellationChargeDisplay,
        refundableAmount: model.refundableAmount,
        refundableAmountDisplay: model.refundableAmountDisplay,
    });
}
//# sourceMappingURL=invoice-cancellation-presentation-model.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentSummaryPresentationModel = createPaymentSummaryPresentationModel;
function createPaymentSummaryPresentationModel(model) {
    return Object.freeze({
        paymentReference: model.paymentReference,
        reservationReference: model.reservationReference,
        traveller: model.traveller,
        totalAmount: model.totalAmount,
        currency: model.currency,
        paymentMethod: model.paymentMethod,
        paymentStatus: model.paymentStatus,
    });
}
//# sourceMappingURL=payment-summary-presentation-model.js.map
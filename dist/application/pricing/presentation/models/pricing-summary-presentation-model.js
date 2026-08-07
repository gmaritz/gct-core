"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPricingSummaryPresentationModel = createPricingSummaryPresentationModel;
function createPricingSummaryPresentationModel(model) {
    return Object.freeze({
        totalPrice: model.totalPrice,
        currency: model.currency,
        travellerCount: model.travellerCount,
        duration: model.duration,
        destination: model.destination,
        primaryCommercialMessage: model.primaryCommercialMessage,
    });
}
//# sourceMappingURL=pricing-summary-presentation-model.js.map
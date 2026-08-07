"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPricingBreakdownPresentationModel = createPricingBreakdownPresentationModel;
function createPricingBreakdownPresentationModel(model) {
    return Object.freeze({
        accommodationSubtotal: model.accommodationSubtotal,
        experiencesSubtotal: model.experiencesSubtotal,
        taxes: model.taxes,
        fees: model.fees,
        discounts: model.discounts,
        markups: model.markups,
        commissions: model.commissions,
        grandTotal: model.grandTotal,
        currency: model.currency,
    });
}
//# sourceMappingURL=pricing-breakdown-presentation-model.js.map
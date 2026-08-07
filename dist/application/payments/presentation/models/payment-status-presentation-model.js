"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentStatusPresentationModel = createPaymentStatusPresentationModel;
function createPaymentStatusPresentationModel(model) {
    return Object.freeze({
        headline: model.headline,
        statusBadge: model.statusBadge,
        nextAction: model.nextAction,
        warnings: Object.freeze([...(model.warnings ?? [])]),
        informationalMessages: Object.freeze([...(model.informationalMessages ?? [])]),
    });
}
//# sourceMappingURL=payment-status-presentation-model.js.map
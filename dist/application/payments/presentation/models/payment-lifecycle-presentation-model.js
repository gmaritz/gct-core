"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentLifecyclePresentationModel = createPaymentLifecyclePresentationModel;
function createPaymentLifecyclePresentationModel(model) {
    return Object.freeze({
        authorizationStatus: model.authorizationStatus,
        captureStatus: model.captureStatus,
        settlementStatus: model.settlementStatus,
        refundStatus: model.refundStatus,
        lifecycleTimeline: Object.freeze((model.lifecycleTimeline ?? []).map((entry) => Object.freeze({
            eventType: entry.eventType,
            occurredAt: new Date(entry.occurredAt.getTime()),
            note: entry.note,
        }))),
    });
}
//# sourceMappingURL=payment-lifecycle-presentation-model.js.map
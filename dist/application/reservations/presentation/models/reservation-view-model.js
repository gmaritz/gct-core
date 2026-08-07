"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReservationViewModel = createReservationViewModel;
function cloneDate(value) {
    return new Date(value.getTime());
}
function freezePayment(payment) {
    return Object.freeze({
        status: payment.status,
        progress: payment.progress,
    });
}
function freezeNextAction(action) {
    return Object.freeze({
        label: action.label,
        href: action.href,
        style: action.style,
    });
}
function createReservationViewModel(model) {
    return Object.freeze({
        id: model.id,
        title: model.title,
        subtitle: model.subtitle,
        status: model.status,
        statusBadgeStyle: model.statusBadgeStyle,
        travellers: model.travellers,
        accommodationSummary: model.accommodationSummary,
        pricingSummary: model.pricingSummary,
        payment: freezePayment(model.payment),
        timelineHeadline: model.timelineHeadline,
        outstandingActions: Object.freeze([...model.outstandingActions]),
        warnings: Object.freeze([...model.warnings]),
        nextAction: freezeNextAction(model.nextAction),
        metadata: Object.freeze({
            generatedAt: cloneDate(model.metadata.generatedAt),
            version: model.metadata.version,
            requestId: model.metadata.requestId,
        }),
    });
}
//# sourceMappingURL=reservation-view-model.js.map
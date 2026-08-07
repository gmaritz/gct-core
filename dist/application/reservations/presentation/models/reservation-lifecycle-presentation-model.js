"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReservationLifecyclePresentationModel = createReservationLifecyclePresentationModel;
function cloneDate(value) {
    return new Date(value.getTime());
}
function freezeBookingProgress(progress) {
    return Object.freeze({
        stage: progress.stage,
        percentage: progress.percentage,
    });
}
function freezePaymentProgress(progress) {
    return Object.freeze({
        paidAmount: progress.paidAmount,
        outstandingAmount: progress.outstandingAmount,
        complete: progress.complete,
    });
}
function freezeTimelineEntry(entry) {
    return Object.freeze({
        milestone: entry.milestone,
        occurredAt: cloneDate(entry.occurredAt),
        note: entry.note,
    });
}
function createReservationLifecyclePresentationModel(model) {
    return Object.freeze({
        status: model.status,
        bookingProgress: freezeBookingProgress(model.bookingProgress),
        paymentProgress: freezePaymentProgress(model.paymentProgress),
        outstandingActions: Object.freeze([...model.outstandingActions]),
        timelineSummary: Object.freeze(model.timelineSummary.map(freezeTimelineEntry)),
        nextRecommendedAction: model.nextRecommendedAction,
        metadata: Object.freeze({
            generatedAt: cloneDate(model.metadata.generatedAt),
            version: model.metadata.version,
            requestId: model.metadata.requestId,
        }),
    });
}
//# sourceMappingURL=reservation-lifecycle-presentation-model.js.map
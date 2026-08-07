"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentProcessingContext = createPaymentProcessingContext;
const models_1 = require("../../models");
function cloneDate(value) {
    return new Date(value.getTime());
}
function freezeReservationSnapshot(snapshot) {
    return Object.freeze({
        snapshotId: snapshot.snapshotId,
        capturedAt: cloneDate(snapshot.capturedAt),
        version: snapshot.version,
        reservationId: snapshot.reservationId,
        reservationReference: snapshot.reservationReference,
    });
}
function freezePricingSnapshot(snapshot) {
    return Object.freeze({
        snapshotId: snapshot.snapshotId,
        capturedAt: cloneDate(snapshot.capturedAt),
        version: snapshot.version,
        pricingId: snapshot.pricingId,
        subtotal: snapshot.subtotal,
        taxes: snapshot.taxes,
        discounts: snapshot.discounts,
        fees: snapshot.fees,
        total: snapshot.total,
        currency: snapshot.currency,
    });
}
function createPaymentProcessingContext(context) {
    return Object.freeze({
        paymentSnapshot: (0, models_1.createPaymentState)(context.paymentSnapshot),
        reservationSnapshot: freezeReservationSnapshot(context.reservationSnapshot),
        pricingSnapshot: freezePricingSnapshot(context.pricingSnapshot),
        paymentMethod: context.paymentMethod,
        processingMetadata: Object.freeze({
            ...(0, models_1.createPaymentMetadata)(context.processingMetadata),
            correlationId: context.processingMetadata.correlationId,
        }),
    });
}
//# sourceMappingURL=payment-processing-context.js.map
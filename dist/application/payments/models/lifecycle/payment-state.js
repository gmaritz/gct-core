"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentState = createPaymentState;
const authorization_1 = require("../authorization");
const capture_1 = require("../capture");
const identity_1 = require("../identity");
const method_1 = require("../method");
const refund_1 = require("../refund");
const settlement_1 = require("../settlement");
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
function freezeQuoteSnapshot(snapshot) {
    return Object.freeze({
        snapshotId: snapshot.snapshotId,
        capturedAt: cloneDate(snapshot.capturedAt),
        version: snapshot.version,
        quoteId: snapshot.quoteId,
        quotationNumber: snapshot.quotationNumber,
        expiresAt: cloneDate(snapshot.expiresAt),
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
function createPaymentState(state) {
    return Object.freeze({
        reference: (0, identity_1.createPaymentReference)(state.reference),
        reservationSnapshot: freezeReservationSnapshot(state.reservationSnapshot),
        quoteSnapshot: state.quoteSnapshot ? freezeQuoteSnapshot(state.quoteSnapshot) : undefined,
        pricingSnapshot: freezePricingSnapshot(state.pricingSnapshot),
        paymentAmount: state.paymentAmount,
        currency: state.currency,
        paymentMethod: state.paymentMethod,
        paymentInstrument: state.paymentInstrument ? (0, method_1.createPaymentInstrument)(state.paymentInstrument) : undefined,
        status: state.status,
        authorization: state.authorization ? (0, authorization_1.createAuthorizationRecord)(state.authorization) : undefined,
        capture: state.capture ? (0, capture_1.createCaptureRecord)(state.capture) : undefined,
        settlement: state.settlement ? (0, settlement_1.createSettlementRecord)(state.settlement) : undefined,
        refunds: Object.freeze((state.refunds ?? []).map(refund_1.createRefundRecord)),
    });
}
//# sourceMappingURL=payment-state.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = exports.PaymentStatus = void 0;
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["CREATED"] = "CREATED";
    PaymentStatus["PENDING_AUTHORIZATION"] = "PENDING_AUTHORIZATION";
    PaymentStatus["AUTHORIZED"] = "AUTHORIZED";
    PaymentStatus["AUTHORIZATION_FAILED"] = "AUTHORIZATION_FAILED";
    PaymentStatus["CAPTURED"] = "CAPTURED";
    PaymentStatus["SETTLED"] = "SETTLED";
    PaymentStatus["COMPLETED"] = "COMPLETED";
    PaymentStatus["CANCELLED"] = "CANCELLED";
    PaymentStatus["REFUND_REQUESTED"] = "REFUND_REQUESTED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
function cloneDate(value) {
    return new Date(value.getTime());
}
function freezeIdentity(identity) {
    return Object.freeze({
        id: identity.id,
    });
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
function freezeAuthorizationSnapshot(snapshot) {
    return Object.freeze({
        snapshotId: snapshot.snapshotId,
        capturedAt: cloneDate(snapshot.capturedAt),
        version: snapshot.version,
        authorizationId: snapshot.authorizationId,
        authorizedAt: cloneDate(snapshot.authorizedAt),
        amount: snapshot.amount,
        currency: snapshot.currency,
        providerReference: snapshot.providerReference,
        status: snapshot.status,
    });
}
function freezeCaptureSnapshot(snapshot) {
    return Object.freeze({
        snapshotId: snapshot.snapshotId,
        capturedAt: cloneDate(snapshot.capturedAt),
        version: snapshot.version,
        captureId: snapshot.captureId,
        amount: snapshot.amount,
        currency: snapshot.currency,
        providerReference: snapshot.providerReference,
        status: snapshot.status,
    });
}
function freezeSettlementSnapshot(snapshot) {
    return Object.freeze({
        snapshotId: snapshot.snapshotId,
        capturedAt: cloneDate(snapshot.capturedAt),
        version: snapshot.version,
        settlementId: snapshot.settlementId,
        settledAt: cloneDate(snapshot.settledAt),
        amount: snapshot.amount,
        currency: snapshot.currency,
        providerReference: snapshot.providerReference,
        status: snapshot.status,
    });
}
function freezeRefundSnapshot(snapshot) {
    return Object.freeze({
        snapshotId: snapshot.snapshotId,
        capturedAt: cloneDate(snapshot.capturedAt),
        version: snapshot.version,
        refundId: snapshot.refundId,
        requestedAt: cloneDate(snapshot.requestedAt),
        refundedAt: typeof snapshot.refundedAt === "undefined" ? undefined : cloneDate(snapshot.refundedAt),
        amount: snapshot.amount,
        currency: snapshot.currency,
        reason: snapshot.reason,
        status: snapshot.status,
    });
}
function freezeTimelineEntry(entry) {
    return Object.freeze({
        snapshotId: entry.snapshotId,
        capturedAt: cloneDate(entry.capturedAt),
        version: entry.version,
        milestone: entry.milestone,
        occurredAt: cloneDate(entry.occurredAt),
        note: entry.note,
    });
}
function freezeMetadata(metadata) {
    return Object.freeze({
        createdAt: cloneDate(metadata.createdAt),
        updatedAt: cloneDate(metadata.updatedAt),
        version: metadata.version,
        source: metadata.source,
    });
}
function isBlank(value) {
    return typeof value !== "string" || value.trim().length === 0;
}
function ensureInvariant(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}
function validateRequiredComposition(composition) {
    ensureInvariant(!isBlank(composition.identity?.id), "Payment identity is required.");
    ensureInvariant(typeof composition.reservationSnapshot === "object" && composition.reservationSnapshot !== null, "Reservation snapshot is required.");
    ensureInvariant(typeof composition.pricingSnapshot === "object" && composition.pricingSnapshot !== null, "Pricing snapshot is required.");
    ensureInvariant(!isBlank(composition.paymentMethod), "Payment method is required.");
    ensureInvariant(!isBlank(composition.currency), "Payment currency is required.");
    ensureInvariant(typeof composition.status === "string", "Payment status is required.");
    ensureInvariant(typeof composition.metadata === "object" && composition.metadata !== null, "Payment metadata is required.");
}
class Payment {
    constructor(composition) {
        validateRequiredComposition(composition);
        this.identity = freezeIdentity(composition.identity);
        this.reservationSnapshot = freezeReservationSnapshot(composition.reservationSnapshot);
        this.quoteSnapshot =
            typeof composition.quoteSnapshot === "undefined"
                ? undefined
                : freezeQuoteSnapshot(composition.quoteSnapshot);
        this.pricingSnapshot = freezePricingSnapshot(composition.pricingSnapshot);
        this.paymentAmount = composition.paymentAmount;
        this.currency = composition.currency;
        this.paymentMethod = composition.paymentMethod;
        this.status = composition.status;
        this.authorizationSnapshot =
            typeof composition.authorizationSnapshot === "undefined"
                ? undefined
                : freezeAuthorizationSnapshot(composition.authorizationSnapshot);
        this.captureSnapshot =
            typeof composition.captureSnapshot === "undefined"
                ? undefined
                : freezeCaptureSnapshot(composition.captureSnapshot);
        this.settlementSnapshot =
            typeof composition.settlementSnapshot === "undefined"
                ? undefined
                : freezeSettlementSnapshot(composition.settlementSnapshot);
        this.refunds = Object.freeze((composition.refunds ?? []).map(freezeRefundSnapshot));
        this.timeline = Object.freeze((composition.timeline ?? []).map(freezeTimelineEntry));
        this.metadata = freezeMetadata(composition.metadata);
        Object.freeze(this);
    }
    static create(composition) {
        return new Payment(composition);
    }
    static restore(composition) {
        return new Payment(composition);
    }
}
exports.Payment = Payment;
//# sourceMappingURL=payment.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayFastItnProcessor = void 0;
const payments_1 = require("@application/payments");
const payments_2 = require("@application/payments");
const payfast_itn_security_1 = require("./payfast-itn-security");
function fieldsByName(fields) {
    return new Map(fields.map(({ name, value }) => [name, value]));
}
function requiredField(fields, name) {
    const value = fields.get(name)?.trim();
    if (!value)
        throw new payfast_itn_security_1.PayFastItnRequestError(400, "Payment notification is incomplete.");
    return value;
}
function toMinorUnits(value) {
    const normalized = String(value).trim();
    const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(normalized);
    if (!match)
        throw new payfast_itn_security_1.PayFastItnRequestError(400, "Payment notification amount is invalid.");
    return BigInt(match[1]) * 100n + BigInt((match[2] ?? "").padEnd(2, "0"));
}
class PayFastItnProcessor {
    constructor(config, paymentAttemptRepository, reservationRepository, serverValidator) {
        this.config = config;
        this.paymentAttemptRepository = paymentAttemptRepository;
        this.reservationRepository = reservationRepository;
        this.serverValidator = serverValidator;
    }
    async process(rawBody, peerAddress) {
        const fields = (0, payfast_itn_security_1.parsePayFastItnFields)(rawBody);
        if (!(0, payfast_itn_security_1.isPayFastItnSourceAddress)(peerAddress)) {
            throw new payfast_itn_security_1.PayFastItnRequestError(403, "Payment notification source is not permitted.");
        }
        if (!(0, payfast_itn_security_1.verifyPayFastItnSignature)(fields, this.config.passphrase)) {
            throw new payfast_itn_security_1.PayFastItnRequestError(403, "Payment notification signature is invalid.");
        }
        let serverValidated;
        try {
            serverValidated = await this.serverValidator.validate(rawBody, this.config.environment);
        }
        catch {
            throw new payfast_itn_security_1.PayFastItnRequestError(503, "Payment notification validation is temporarily unavailable.");
        }
        if (!serverValidated) {
            throw new payfast_itn_security_1.PayFastItnRequestError(403, "Payment notification validation failed.");
        }
        const values = fieldsByName(fields);
        const paymentReference = requiredField(values, "m_payment_id");
        const providerTransactionId = requiredField(values, "pf_payment_id");
        const merchantId = requiredField(values, "merchant_id");
        const rawStatus = requiredField(values, "payment_status").toUpperCase();
        const grossAmount = requiredField(values, "amount_gross");
        if (paymentReference.length > 100 || !/^\d+$/.test(providerTransactionId) || !/^\d{8}$/.test(merchantId)) {
            throw new payfast_itn_security_1.PayFastItnRequestError(400, "Payment notification identifiers are invalid.");
        }
        if (merchantId !== this.config.merchantId) {
            throw new payfast_itn_security_1.PayFastItnRequestError(403, "Payment notification merchant does not match configuration.");
        }
        if (rawStatus !== "COMPLETE" && rawStatus !== "CANCELLED") {
            throw new payfast_itn_security_1.PayFastItnRequestError(400, "Payment notification status is unsupported.");
        }
        const attempt = await this.paymentAttemptRepository.findByPaymentReference(paymentReference);
        if (!attempt)
            throw new payments_1.PaymentAttemptNotFoundError();
        if (attempt.provider !== "PAYFAST" || attempt.environment !== this.config.environment || attempt.currency !== "ZAR") {
            throw new payments_1.PaymentAttemptNotificationConflictError("Payment attempt provider, environment, or currency does not match.");
        }
        const notificationAmountMinor = toMinorUnits(grossAmount);
        const attemptAmountMinor = toMinorUnits(attempt.amount);
        if (notificationAmountMinor !== attemptAmountMinor) {
            throw new payments_1.PaymentAttemptNotificationConflictError("Payment notification amount does not match the persisted attempt.");
        }
        const paymentStatus = rawStatus === "COMPLETE" ? payments_2.PaymentStatus.COMPLETED : payments_2.PaymentStatus.CANCELLED;
        const notificationHash = (0, payfast_itn_security_1.hashPayFastItnBody)(rawBody);
        if (attempt.status === paymentStatus) {
            if (attempt.providerTransactionId === providerTransactionId
                && attempt.providerNotificationHash === notificationHash)
                return Object.freeze({ status: "DUPLICATE", paymentReference });
            throw new payments_1.PaymentAttemptNotificationConflictError("A conflicting notification already exists for this attempt.");
        }
        if (attempt.status !== payments_2.PaymentStatus.AUTHORIZATION_REQUESTED || attempt.providerTransactionId) {
            throw new payments_1.PaymentAttemptNotificationConflictError("Payment attempt is not awaiting a PayFast notification.");
        }
        const reservation = await this.reservationRepository.findById(attempt.reservationId);
        if (!reservation || reservation.identity.id !== attempt.reservationId || !reservation.pricingSnapshot) {
            throw new payments_1.PaymentAttemptNotificationConflictError("Canonical Reservation context is unavailable.");
        }
        if (attempt.paymentId !== `payment-${reservation.identity.id}`) {
            throw new payments_1.PaymentAttemptNotificationConflictError("Payment attempt does not match the canonical Payment identity for this Reservation.");
        }
        const expectedPaymentSnapshot = reservation.paymentSnapshot;
        if (!expectedPaymentSnapshot)
            throw new payments_1.PaymentAttemptNotificationConflictError("Reservation payment snapshot is unavailable.");
        let transitionedReservation;
        try {
            transitionedReservation = (0, payments_1.transitionReservationFromVerifiedPayFastNotification)(reservation, attempt, rawStatus, grossAmount);
        }
        catch {
            throw new payments_1.PaymentAttemptNotificationConflictError("Verified notification cannot be applied to the canonical Reservation state.");
        }
        const transitionedPaymentSnapshot = transitionedReservation.paymentSnapshot;
        if (!transitionedPaymentSnapshot)
            throw new payments_1.PaymentAttemptNotificationConflictError("Payment transition could not be constructed.");
        const result = await this.paymentAttemptRepository.applyVerifiedPayFastNotification({
            paymentReference,
            reservationId: reservation.identity.id,
            providerTransactionId,
            notificationHash,
            providerStatus: rawStatus,
            paymentStatus,
            expectedPaymentSnapshot,
            nextPaymentSnapshot: transitionedPaymentSnapshot,
            nextReservationMetadata: transitionedReservation.metadata,
        });
        return Object.freeze({ status: result, paymentReference });
    }
}
exports.PayFastItnProcessor = PayFastItnProcessor;
//# sourceMappingURL=payfast-itn-processor.js.map
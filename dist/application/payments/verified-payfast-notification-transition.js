"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transitionReservationFromVerifiedPayFastNotification = transitionReservationFromVerifiedPayFastNotification;
const aggregate_1 = require("../reservations/aggregate");
const models_1 = require("./models");
function toMinorUnits(value) {
    const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(String(value).trim());
    if (!match)
        throw new Error("Payment amount must have no more than two decimal places.");
    return BigInt(match[1]) * 100n + BigInt((match[2] ?? "").padEnd(2, "0"));
}
function transitionReservationFromVerifiedPayFastNotification(reservation, attempt, providerStatus, verifiedGrossAmount, occurredAt = new Date()) {
    if (attempt.provider !== "PAYFAST" || attempt.reservationId !== reservation.identity.id) {
        throw new Error("Payment attempt does not belong to this PayFast Reservation.");
    }
    if (attempt.paymentId !== `payment-${reservation.identity.id}` || attempt.currency !== "ZAR") {
        throw new Error("Payment attempt does not match the canonical Payment identity or currency.");
    }
    if (attempt.status !== models_1.PaymentStatus.AUTHORIZATION_REQUESTED) {
        throw new Error("Payment attempt is not awaiting a verified PayFast notification.");
    }
    if (reservation.status === aggregate_1.ReservationStatus.CANCELLED) {
        throw new Error("Cancelled Reservation cannot accept a payment notification.");
    }
    const paymentSnapshot = reservation.paymentSnapshot;
    if (!paymentSnapshot || !reservation.pricingSnapshot) {
        throw new Error("Reservation payment and pricing snapshots are required.");
    }
    if (reservation.pricingSnapshot.currency !== "ZAR") {
        throw new Error("Reservation payment currency must be ZAR.");
    }
    const totalMinor = toMinorUnits(reservation.pricingSnapshot.totalPrice);
    const attemptAmount = toMinorUnits(attempt.amount);
    const receivedMinor = toMinorUnits(paymentSnapshot.amountReceived);
    const outstandingMinor = toMinorUnits(paymentSnapshot.balanceOutstanding);
    const grossMinor = toMinorUnits(verifiedGrossAmount);
    if (receivedMinor + outstandingMinor !== totalMinor) {
        throw new Error("Reservation payment snapshot violates the cumulative payment invariant.");
    }
    if (grossMinor !== attemptAmount) {
        throw new Error("Verified gross amount does not match the persisted payment attempt.");
    }
    if (grossMinor > outstandingMinor) {
        throw new Error("Verified payment exceeds the outstanding Reservation balance.");
    }
    const complete = providerStatus === "COMPLETE";
    const nextReceivedMinor = complete ? receivedMinor + grossMinor : receivedMinor;
    const nextOutstandingMinor = complete ? outstandingMinor - grossMinor : outstandingMinor;
    if (nextReceivedMinor > totalMinor || nextOutstandingMinor < 0n || nextReceivedMinor + nextOutstandingMinor !== totalMinor) {
        throw new Error("Verified payment would violate the cumulative payment invariant.");
    }
    const nextPaymentSnapshot = Object.freeze({
        ...paymentSnapshot,
        ...(complete ? { capturedAt: new Date(occurredAt) } : {}),
        paymentStatus: complete
            ? nextOutstandingMinor === 0n ? models_1.PaymentStatus.COMPLETED : "PARTIAL"
            : paymentSnapshot.paymentStatus,
        amountReceived: Number(nextReceivedMinor) / 100,
        balanceOutstanding: Number(nextOutstandingMinor) / 100,
    });
    return aggregate_1.Reservation.restore({
        identity: reservation.identity,
        reservationNumber: reservation.reservationNumber,
        status: reservation.status,
        journeySnapshot: reservation.journeySnapshot,
        travellerSnapshots: reservation.travellerSnapshots,
        accommodationSnapshots: reservation.accommodationSnapshots,
        bookingItems: reservation.bookingItems,
        pricingSnapshot: reservation.pricingSnapshot,
        paymentSnapshot: nextPaymentSnapshot,
        supplierReferences: reservation.supplierReferences,
        timeline: reservation.timeline,
        metadata: { ...reservation.metadata, updatedAt: new Date(occurredAt) },
    });
}
//# sourceMappingURL=verified-payfast-notification-transition.js.map
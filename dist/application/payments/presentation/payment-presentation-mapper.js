"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentPresentationMapper = void 0;
const models_1 = require("./models");
function resolveRefundStatus(refunds) {
    if (refunds.length === 0) {
        return "NOT_STARTED";
    }
    return refunds[refunds.length - 1].status;
}
function resolveStatusBadge(status) {
    if (status === "COMPLETED" || status === "SETTLED" || status === "CAPTURED") {
        return "success";
    }
    if (status.includes("FAILED") || status === "CANCELLED") {
        return "warning";
    }
    return "neutral";
}
function resolveNextAction(result) {
    if (result.metadata.pending) {
        return "Complete required payment action";
    }
    if (!result.success) {
        return "Retry payment";
    }
    return "No action required";
}
function resolveHeadline(result) {
    if (result.metadata.pending) {
        return "Payment action required";
    }
    return result.success ? "Payment ready" : "Payment unsuccessful";
}
function informationalMessage(result) {
    const stage = result.metadata.stages[result.metadata.stages.length - 1] ?? "RESULT";
    return `Payment mapped at ${stage.toLowerCase()} stage`;
}
class PaymentPresentationMapper {
    map(result) {
        if (!result.success || !result.payment) {
            return null;
        }
        const payment = result.payment;
        const summary = (0, models_1.createPaymentSummaryPresentationModel)({
            paymentReference: payment.reference.paymentId,
            reservationReference: payment.reservationSnapshot.reservationReference,
            traveller: payment.paymentInstrument?.holderName ?? "Traveller pending",
            totalAmount: payment.paymentAmount,
            currency: payment.currency,
            paymentMethod: payment.paymentMethod,
            paymentStatus: payment.status,
        });
        const lifecycle = (0, models_1.createPaymentLifecyclePresentationModel)({
            authorizationStatus: payment.authorization?.status ?? "NOT_STARTED",
            captureStatus: payment.capture?.status ?? "NOT_STARTED",
            settlementStatus: payment.settlement?.status ?? "NOT_STARTED",
            refundStatus: resolveRefundStatus(payment.refunds),
            lifecycleTimeline: payment.timeline.map((event) => ({
                eventType: event.eventType,
                occurredAt: event.occurredAt,
                note: event.note,
            })),
        });
        const warnings = Object.freeze([
            ...result.validationResult.warnings,
            ...(result.policyEvaluation?.warnings ?? []),
            ...(result.processingResult?.warnings ?? []),
        ]);
        const status = (0, models_1.createPaymentStatusPresentationModel)({
            headline: resolveHeadline(result),
            statusBadge: resolveStatusBadge(payment.status),
            nextAction: resolveNextAction(result),
            warnings,
            informationalMessages: Object.freeze([informationalMessage(result)]),
        });
        return Object.freeze({
            summary,
            lifecycle,
            status,
        });
    }
}
exports.PaymentPresentationMapper = PaymentPresentationMapper;
//# sourceMappingURL=payment-presentation-mapper.js.map
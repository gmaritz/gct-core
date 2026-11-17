"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentExperienceViewModelProvider = void 0;
const payments_1 = require("../../../application/payments");
function mapStatus(result) {
    switch (result.status) {
        case "INITIATED": return "INITIATED";
        case "PENDING": return "PENDING";
        case "FAILED": return "FAILED";
        case "UNAVAILABLE": return "UNAVAILABLE";
        case "COMPLETED": return "COMPLETED";
        case "CANCELLED": return "CANCELLED";
        case "UNKNOWN": return "UNKNOWN";
        default: return "UNKNOWN";
    }
}
function mapPaymentAttemptStatus(status) {
    switch (status) {
        case payments_1.PaymentStatus.COMPLETED: return "COMPLETED";
        case payments_1.PaymentStatus.CANCELLED: return "CANCELLED";
        case payments_1.PaymentStatus.AUTHORIZATION_FAILED: return "FAILED";
        default: return "PENDING";
    }
}
function messageFor(status) {
    switch (status) {
        case "INITIATED": return "Payment has been initiated with the secure payment provider.";
        case "PENDING": return "Payment is pending confirmation from the payment provider.";
        case "FAILED": return "Payment could not be initiated. Please try again.";
        case "UNAVAILABLE": return "Payment is not available until a confirmed reservation payment context exists.";
        case "COMPLETED": return "Payment has been completed according to the current application state.";
        case "CANCELLED": return "Payment was cancelled. You can return to the payment stage to review it.";
        default: return "Payment status is not yet available.";
    }
}
class PaymentExperienceViewModelProvider {
    provide(result, journeyId = result.reservationId, simulatedSupplierFulfilment = false, paymentAttempt) {
        const status = paymentAttempt ? mapPaymentAttemptStatus(paymentAttempt.status) : mapStatus(result);
        const reservationConfirmed = paymentAttempt
            ? paymentAttempt.reservationPaymentStatus === "COMPLETED"
            : status === "COMPLETED";
        const canInitiate = !paymentAttempt
            && result.status === "PENDING"
            && result.paymentStatus === payments_1.PaymentStatus.CREATED
            && !result.paymentAttemptId
            && !result.hostedPaymentAction;
        return Object.freeze({
            journeyId,
            amount: result.amount,
            currency: result.currency,
            status,
            message: paymentAttempt?.status === payments_1.PaymentStatus.CANCELLED
                ? "This payment attempt was cancelled. The reservation payment balance remains unchanged until verified payment processing."
                : canInitiate
                    ? "Your reservation is ready for secure payment."
                    : status === "UNAVAILABLE" && result.amount !== undefined
                        ? "Payment is unavailable for this outstanding balance. Please review your reservation."
                        : messageFor(status),
            paymentAttemptStatus: paymentAttempt?.status,
            reservationPaymentStatus: paymentAttempt?.reservationPaymentStatus,
            balanceOutstanding: paymentAttempt?.balanceOutstanding,
            supplierFulfilmentNotice: simulatedSupplierFulfilment
                ? "Test only: accommodation supplier fulfilment was simulated. No Hotelbeds booking was created."
                : undefined,
            initiationAction: canInitiate
                ? Object.freeze({ label: "Proceed to secure payment", href: `/ui/journeys/${journeyId}/payment`, style: "primary" })
                : undefined,
            providerAction: result.hostedPaymentAction && (result.status === "INITIATED" || result.status === "PENDING")
                ? Object.freeze({ label: "Proceed to secure payment", href: result.hostedPaymentAction.action, style: "primary" })
                : undefined,
            hostedPaymentAction: result.hostedPaymentAction
                ? Object.freeze({
                    method: result.hostedPaymentAction.method,
                    action: result.hostedPaymentAction.action,
                    fields: Object.freeze({ ...result.hostedPaymentAction.fields }),
                })
                : undefined,
            recoveryAction: Object.freeze({ label: "Return to reservation review", href: `/ui/journeys/${journeyId}/review`, style: "neutral" }),
            confirmationAction: reservationConfirmed
                ? Object.freeze({ label: "View booking confirmation", href: `/ui/journeys/${journeyId}/confirmation`, style: "primary" })
                : undefined,
        });
    }
}
exports.PaymentExperienceViewModelProvider = PaymentExperienceViewModelProvider;
//# sourceMappingURL=payment-experience.viewmodel-provider.js.map
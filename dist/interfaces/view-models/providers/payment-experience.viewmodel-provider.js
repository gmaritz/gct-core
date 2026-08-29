"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentExperienceViewModelProvider = void 0;
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
    provide(result, journeyId = result.reservationId) {
        const status = mapStatus(result);
        return Object.freeze({
            journeyId,
            amount: result.amount,
            currency: result.currency,
            status,
            message: messageFor(status),
            providerAction: result.status === "INITIATED" || result.status === "PENDING"
                ? Object.freeze({ label: "Proceed to secure payment", href: "#secure-payment", style: "primary" })
                : undefined,
            hostedPaymentAction: result.hostedPaymentAction
                ? Object.freeze({
                    method: result.hostedPaymentAction.method,
                    action: result.hostedPaymentAction.action,
                    fields: Object.freeze({ ...result.hostedPaymentAction.fields }),
                })
                : undefined,
            recoveryAction: Object.freeze({ label: "Return to reservation review", href: `/ui/journeys/${journeyId}/review`, style: "neutral" }),
            confirmationAction: status === "COMPLETED"
                ? Object.freeze({ label: "View booking confirmation", href: `/ui/journeys/${journeyId}/confirmation`, style: "primary" })
                : undefined,
        });
    }
}
exports.PaymentExperienceViewModelProvider = PaymentExperienceViewModelProvider;
//# sourceMappingURL=payment-experience.viewmodel-provider.js.map
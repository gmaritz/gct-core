"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentViewModelProvider = void 0;
const models_1 = require("./models");
const payment_presentation_mapper_1 = require("./payment-presentation-mapper");
function formatMoney(amount, currency) {
    return `${currency} ${amount.toFixed(2)}`;
}
function resolvePaymentMethodBadge(paymentMethod) {
    switch (paymentMethod) {
        case "CARD":
        case "WALLET":
            return "info";
        default:
            return "neutral";
    }
}
function resolveCta(status) {
    if (status.nextAction.toLowerCase().startsWith("complete required")) {
        return {
            label: "Complete Action",
            href: "#payment-action",
            style: "secondary",
        };
    }
    if (status.nextAction.includes("Retry")) {
        return {
            label: "Retry Payment",
            href: "#payment-retry",
            style: "primary",
        };
    }
    return {
        label: "View Payment",
        href: "#payment-summary",
        style: "neutral",
    };
}
class PaymentViewModelProvider {
    constructor(mapper = new payment_presentation_mapper_1.PaymentPresentationMapper()) {
        this.mapper = mapper;
    }
    provideViewModel(summary, lifecycle, status, requestId) {
        return (0, models_1.createPaymentViewModel)({
            summary,
            lifecycle,
            status,
            cta: resolveCta(status),
            badgeStyles: {
                statusBadge: status.statusBadge,
                paymentMethodBadge: resolvePaymentMethodBadge(summary.paymentMethod),
            },
            displayLabels: {
                totalLabel: formatMoney(summary.totalAmount, summary.currency),
                statusLabel: summary.paymentStatus,
                lifecycleLabel: `${lifecycle.authorizationStatus} / ${lifecycle.captureStatus} / ${lifecycle.settlementStatus}`,
            },
            metadata: {
                generatedAt: new Date(),
                version: "1.0.0",
                requestId,
            },
        });
    }
    mapPaymentResultToViewModel(result) {
        const presentation = this.mapper.map(result);
        if (!presentation) {
            return null;
        }
        return this.provideViewModel(presentation.summary, presentation.lifecycle, presentation.status, result.metadata.requestId);
    }
}
exports.PaymentViewModelProvider = PaymentViewModelProvider;
//# sourceMappingURL=payment-view-model-provider.js.map
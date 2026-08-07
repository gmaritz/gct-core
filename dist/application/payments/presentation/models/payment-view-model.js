"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentViewModel = createPaymentViewModel;
const payment_lifecycle_presentation_model_1 = require("./payment-lifecycle-presentation-model");
const payment_status_presentation_model_1 = require("./payment-status-presentation-model");
const payment_summary_presentation_model_1 = require("./payment-summary-presentation-model");
function createPaymentViewModel(viewModel) {
    return Object.freeze({
        summary: (0, payment_summary_presentation_model_1.createPaymentSummaryPresentationModel)(viewModel.summary),
        lifecycle: (0, payment_lifecycle_presentation_model_1.createPaymentLifecyclePresentationModel)(viewModel.lifecycle),
        status: (0, payment_status_presentation_model_1.createPaymentStatusPresentationModel)(viewModel.status),
        cta: Object.freeze({
            label: viewModel.cta.label,
            href: viewModel.cta.href,
            style: viewModel.cta.style,
        }),
        badgeStyles: Object.freeze({
            statusBadge: viewModel.badgeStyles.statusBadge,
            paymentMethodBadge: viewModel.badgeStyles.paymentMethodBadge,
        }),
        displayLabels: Object.freeze({
            totalLabel: viewModel.displayLabels.totalLabel,
            statusLabel: viewModel.displayLabels.statusLabel,
            lifecycleLabel: viewModel.displayLabels.lifecycleLabel,
        }),
        metadata: Object.freeze({
            generatedAt: new Date(viewModel.metadata.generatedAt.getTime()),
            version: viewModel.metadata.version,
            requestId: viewModel.metadata.requestId,
        }),
    });
}
//# sourceMappingURL=payment-view-model.js.map
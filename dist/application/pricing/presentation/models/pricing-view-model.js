"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPricingViewModel = createPricingViewModel;
const pricing_breakdown_presentation_model_1 = require("./pricing-breakdown-presentation-model");
const pricing_summary_presentation_model_1 = require("./pricing-summary-presentation-model");
const quote_presentation_model_1 = require("./quote-presentation-model");
function createPricingViewModel(viewModel) {
    return Object.freeze({
        summary: (0, pricing_summary_presentation_model_1.createPricingSummaryPresentationModel)(viewModel.summary),
        breakdown: (0, pricing_breakdown_presentation_model_1.createPricingBreakdownPresentationModel)(viewModel.breakdown),
        quote: (0, quote_presentation_model_1.createQuotePresentationModel)(viewModel.quote),
        cta: Object.freeze({
            label: viewModel.cta.label,
            href: viewModel.cta.href,
            style: viewModel.cta.style,
        }),
        badgeStyles: Object.freeze({
            quoteStatus: viewModel.badgeStyles.quoteStatus,
            priceSignal: viewModel.badgeStyles.priceSignal,
        }),
        displayLabels: Object.freeze({
            totalLabel: viewModel.displayLabels.totalLabel,
            taxLabel: viewModel.displayLabels.taxLabel,
            feesLabel: viewModel.displayLabels.feesLabel,
            discountsLabel: viewModel.displayLabels.discountsLabel,
            quoteLabel: viewModel.displayLabels.quoteLabel,
        }),
        metadata: Object.freeze({
            generatedAt: new Date(viewModel.metadata.generatedAt.getTime()),
            version: viewModel.metadata.version,
            requestId: viewModel.metadata.requestId,
        }),
    });
}
//# sourceMappingURL=pricing-view-model.js.map
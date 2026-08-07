"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingViewModelProvider = void 0;
const models_1 = require("./models");
const pricing_presentation_mapper_1 = require("./pricing-presentation-mapper");
function formatMoney(amount, currency) {
    return `${currency} ${amount.toFixed(2)}`;
}
function resolveQuoteBadge(status) {
    switch (status) {
        case "ISSUED":
        case "ACCEPTED":
            return "success";
        case "EXPIRED":
        case "DECLINED":
            return "warning";
        default:
            return "neutral";
    }
}
class PricingViewModelProvider {
    constructor(mapper = new pricing_presentation_mapper_1.PricingPresentationMapper()) {
        this.mapper = mapper;
    }
    provideViewModel(summary, breakdown, quote, requestId) {
        return (0, models_1.createPricingViewModel)({
            summary,
            breakdown,
            quote,
            cta: {
                label: quote.quoteStatus === "EXPIRED" ? "Refresh Quote" : "Continue to Booking",
                href: `#quote-${quote.quotationReference}`,
                style: quote.quoteStatus === "EXPIRED" ? "neutral" : "primary",
            },
            badgeStyles: {
                quoteStatus: resolveQuoteBadge(quote.quoteStatus),
                priceSignal: breakdown.discounts > 0 ? "positive" : "neutral",
            },
            displayLabels: {
                totalLabel: formatMoney(breakdown.grandTotal, breakdown.currency),
                taxLabel: formatMoney(breakdown.taxes, breakdown.currency),
                feesLabel: formatMoney(breakdown.fees, breakdown.currency),
                discountsLabel: formatMoney(breakdown.discounts, breakdown.currency),
                quoteLabel: quote.quoteStatus,
            },
            metadata: {
                generatedAt: new Date(),
                version: "1.0.0",
                requestId,
            },
        });
    }
    mapPricingResultToViewModel(result) {
        const presentation = this.mapper.map(result);
        if (!presentation) {
            return null;
        }
        return this.provideViewModel(presentation.summary, presentation.breakdown, presentation.quote, result.metadata.requestId);
    }
}
exports.PricingViewModelProvider = PricingViewModelProvider;
//# sourceMappingURL=pricing-view-model-provider.js.map
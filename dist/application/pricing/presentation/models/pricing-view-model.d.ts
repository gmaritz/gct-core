import { PricingBreakdownPresentationModel } from "./pricing-breakdown-presentation-model";
import { PricingSummaryPresentationModel } from "./pricing-summary-presentation-model";
import { QuotePresentationModel } from "./quote-presentation-model";
export interface PricingViewModel {
    readonly summary: PricingSummaryPresentationModel;
    readonly breakdown: PricingBreakdownPresentationModel;
    readonly quote: QuotePresentationModel;
    readonly cta: {
        readonly label: string;
        readonly href: string;
        readonly style: "primary" | "neutral";
    };
    readonly badgeStyles: {
        readonly quoteStatus: "success" | "warning" | "neutral";
        readonly priceSignal: "positive" | "neutral";
    };
    readonly displayLabels: {
        readonly totalLabel: string;
        readonly taxLabel: string;
        readonly feesLabel: string;
        readonly discountsLabel: string;
        readonly quoteLabel: string;
    };
    readonly metadata: {
        readonly generatedAt: Date;
        readonly version: string;
        readonly requestId: string;
    };
}
export declare function createPricingViewModel(viewModel: PricingViewModel): PricingViewModel;
//# sourceMappingURL=pricing-view-model.d.ts.map
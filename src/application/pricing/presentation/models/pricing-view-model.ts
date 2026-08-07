import {
  createPricingBreakdownPresentationModel,
  PricingBreakdownPresentationModel,
} from "./pricing-breakdown-presentation-model";
import { createPricingSummaryPresentationModel, PricingSummaryPresentationModel } from "./pricing-summary-presentation-model";
import { createQuotePresentationModel, QuotePresentationModel } from "./quote-presentation-model";

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

export function createPricingViewModel(viewModel: PricingViewModel): PricingViewModel {
  return Object.freeze({
    summary: createPricingSummaryPresentationModel(viewModel.summary),
    breakdown: createPricingBreakdownPresentationModel(viewModel.breakdown),
    quote: createQuotePresentationModel(viewModel.quote),
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

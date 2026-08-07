import { PricingEngineResult } from "../engine";
import {
  createPricingViewModel,
  PricingBreakdownPresentationModel,
  PricingSummaryPresentationModel,
  PricingViewModel,
  QuotePresentationModel,
} from "./models";
import { PricingPresentationMapper } from "./pricing-presentation-mapper";

function formatMoney(amount: number, currency: string): string {
  return `${currency} ${amount.toFixed(2)}`;
}

function resolveQuoteBadge(status: string): PricingViewModel["badgeStyles"]["quoteStatus"] {
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

export class PricingViewModelProvider {
  public constructor(
    private readonly mapper: PricingPresentationMapper = new PricingPresentationMapper(),
  ) {}

  public provideViewModel(
    summary: PricingSummaryPresentationModel,
    breakdown: PricingBreakdownPresentationModel,
    quote: QuotePresentationModel,
    requestId: string,
  ): PricingViewModel {
    return createPricingViewModel({
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

  public mapPricingResultToViewModel(result: PricingEngineResult): PricingViewModel | null {
    const presentation = this.mapper.map(result);

    if (!presentation) {
      return null;
    }

    return this.provideViewModel(
      presentation.summary,
      presentation.breakdown,
      presentation.quote,
      result.metadata.requestId,
    );
  }
}

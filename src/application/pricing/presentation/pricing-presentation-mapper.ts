import { PricingLineItem } from "../models";
import { PricingEngineResult } from "../engine";
import {
  createPricingBreakdownPresentationModel,
  createPricingSummaryPresentationModel,
  createQuotePresentationModel,
  PricingBreakdownPresentationModel,
  PricingSummaryPresentationModel,
  QuotePresentationModel,
} from "./models";

export interface PricingPresentationOutput {
  readonly summary: PricingSummaryPresentationModel;
  readonly breakdown: PricingBreakdownPresentationModel;
  readonly quote: QuotePresentationModel;
}

function sumQuantity(lineItems: ReadonlyArray<PricingLineItem>): number {
  const total = lineItems.reduce((value, lineItem) => value + lineItem.quantity, 0);
  return total > 0 ? total : 1;
}

function stageMessage(stages: ReadonlyArray<string>): string {
  const lastStage = stages[stages.length - 1];

  if (!lastStage) {
    return "Pricing generated";
  }

  return `Pricing generated via ${lastStage.toLowerCase()} stage`;
}

function amountByCode(lineItems: ReadonlyArray<PricingLineItem>, codeMatch: string): number {
  const item = lineItems.find((lineItem) => lineItem.code.toUpperCase().includes(codeMatch));
  return item?.totalAmount.amount ?? 0;
}

export class PricingPresentationMapper {
  public map(result: PricingEngineResult): PricingPresentationOutput | null {
    if (!result.successful || !result.pricing) {
      return null;
    }

    const pricing = result.pricing;

    const summary = createPricingSummaryPresentationModel({
      totalPrice: pricing.totals.grandTotal.amount,
      currency: pricing.currency,
      travellerCount: sumQuantity(pricing.breakdown.lineItems),
      duration: "Duration pending",
      destination: "Destination pending",
      primaryCommercialMessage: result.warnings[0] ?? stageMessage(result.metadata.stages),
    });

    const breakdown = createPricingBreakdownPresentationModel({
      accommodationSubtotal: amountByCode(pricing.breakdown.lineItems, "ACCOMMODATION"),
      experiencesSubtotal: amountByCode(pricing.breakdown.lineItems, "EXPERIENCE"),
      taxes: pricing.totals.taxTotal.amount,
      fees: pricing.totals.feeTotal.amount,
      discounts: pricing.totals.discountTotal.amount,
      markups: pricing.totals.markupTotal.amount,
      commissions: pricing.totals.commissionTotal.amount,
      grandTotal: pricing.totals.grandTotal.amount,
      currency: pricing.currency,
    });

    const expiresAt = new Date(pricing.metadata.createdAt.getTime());
    expiresAt.setDate(expiresAt.getDate() + 7);

    const quote = createQuotePresentationModel({
      quoteStatus: "DRAFT",
      validityPeriod: "7 days",
      expiresAt,
      commercialNotes: result.warnings,
      quotationReference: pricing.identity.id,
    });

    return Object.freeze({
      summary,
      breakdown,
      quote,
    });
  }
}

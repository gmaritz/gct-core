import { createPricingLineItem, PricingLineItem } from "./pricing-line-item";

export interface PricingBreakdown {
  readonly lineItems: ReadonlyArray<PricingLineItem>;
}

export function createPricingBreakdown(breakdown: PricingBreakdown): PricingBreakdown {
  return Object.freeze({
    lineItems: Object.freeze(breakdown.lineItems.map(createPricingLineItem)),
  });
}

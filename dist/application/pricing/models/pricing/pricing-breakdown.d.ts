import { PricingLineItem } from "./pricing-line-item";
export interface PricingBreakdown {
    readonly lineItems: ReadonlyArray<PricingLineItem>;
}
export declare function createPricingBreakdown(breakdown: PricingBreakdown): PricingBreakdown;
//# sourceMappingURL=pricing-breakdown.d.ts.map
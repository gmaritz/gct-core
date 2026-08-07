import { Commission, Currency, Discount, Fee, Markup, PricingBreakdown, PricingMetadata, PricingSummary, PricingTotal, TaxBreakdown } from "../models";
export interface PricingIdentity {
    readonly id: string;
}
export interface PricingComposition {
    readonly identity: PricingIdentity;
    readonly summary: PricingSummary;
    readonly breakdown: PricingBreakdown;
    readonly taxes: TaxBreakdown;
    readonly fees: ReadonlyArray<Fee>;
    readonly discounts: ReadonlyArray<Discount>;
    readonly markups: ReadonlyArray<Markup>;
    readonly commissions: ReadonlyArray<Commission>;
    readonly totals: PricingTotal;
    readonly currency: Currency;
    readonly metadata: PricingMetadata;
}
export declare class Pricing {
    readonly identity: PricingIdentity;
    readonly summary: PricingSummary;
    readonly breakdown: PricingBreakdown;
    readonly taxes: TaxBreakdown;
    readonly fees: ReadonlyArray<Fee>;
    readonly discounts: ReadonlyArray<Discount>;
    readonly markups: ReadonlyArray<Markup>;
    readonly commissions: ReadonlyArray<Commission>;
    readonly totals: PricingTotal;
    readonly currency: Currency;
    readonly metadata: PricingMetadata;
    private constructor();
    static create(composition: PricingComposition): Pricing;
    static restore(composition: PricingComposition): Pricing;
}
//# sourceMappingURL=pricing.d.ts.map
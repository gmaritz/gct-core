export interface PricingIdentity {
    readonly id: string;
}
export interface PricingSummary {
    readonly productId: string;
    readonly productType: string;
    readonly description: string;
}
export interface PricingBreakdownLineItem {
    readonly code: string;
    readonly label: string;
    readonly amount: number;
    readonly quantity: number;
}
export interface PricingBreakdown {
    readonly lineItems: ReadonlyArray<PricingBreakdownLineItem>;
}
export interface PricingTaxEntry {
    readonly code: string;
    readonly amount: number;
}
export interface PricingFeeEntry {
    readonly code: string;
    readonly amount: number;
}
export interface PricingDiscountEntry {
    readonly code: string;
    readonly amount: number;
}
export interface PricingMarkupEntry {
    readonly code: string;
    readonly amount: number;
}
export interface PricingCommissionEntry {
    readonly code: string;
    readonly amount: number;
}
export interface PricingTaxSummary {
    readonly entries: ReadonlyArray<PricingTaxEntry>;
}
export interface PricingFeeSummary {
    readonly entries: ReadonlyArray<PricingFeeEntry>;
}
export interface PricingDiscountSummary {
    readonly entries: ReadonlyArray<PricingDiscountEntry>;
}
export interface PricingMarkupSummary {
    readonly entries: ReadonlyArray<PricingMarkupEntry>;
}
export interface PricingCommissionSummary {
    readonly entries: ReadonlyArray<PricingCommissionEntry>;
}
export interface PricingTotals {
    readonly subtotal: number;
    readonly taxTotal: number;
    readonly feeTotal: number;
    readonly discountTotal: number;
    readonly markupTotal: number;
    readonly commissionTotal: number;
    readonly grandTotal: number;
}
export interface PricingMetadata {
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly version: string;
    readonly source: string;
}
export interface PricingComposition {
    readonly identity: PricingIdentity;
    readonly summary: PricingSummary;
    readonly breakdown: PricingBreakdown;
    readonly taxes: PricingTaxSummary;
    readonly fees: PricingFeeSummary;
    readonly discounts: PricingDiscountSummary;
    readonly markups: PricingMarkupSummary;
    readonly commissions: PricingCommissionSummary;
    readonly totals: PricingTotals;
    readonly currency: string;
    readonly metadata: PricingMetadata;
}
export declare class Pricing {
    readonly identity: PricingIdentity;
    readonly summary: PricingSummary;
    readonly breakdown: PricingBreakdown;
    readonly taxes: PricingTaxSummary;
    readonly fees: PricingFeeSummary;
    readonly discounts: PricingDiscountSummary;
    readonly markups: PricingMarkupSummary;
    readonly commissions: PricingCommissionSummary;
    readonly totals: PricingTotals;
    readonly currency: string;
    readonly metadata: PricingMetadata;
    private constructor();
    static create(composition: PricingComposition): Pricing;
    static restore(composition: PricingComposition): Pricing;
}
//# sourceMappingURL=pricing.d.ts.map
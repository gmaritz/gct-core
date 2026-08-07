import { Commission, Currency, Discount, Fee, Markup, PricingBreakdown, PricingSummary, PricingTotal, Promotion, Quote, TaxBreakdown } from "../models";
import { PricingValidationResult } from "./models";
export interface PricingValidationRequest {
    readonly currency?: Currency | null;
    readonly summary?: PricingSummary | null;
    readonly breakdown?: PricingBreakdown | null;
    readonly taxes?: TaxBreakdown | null;
    readonly fees?: ReadonlyArray<Fee> | null;
    readonly discounts?: ReadonlyArray<Discount> | null;
    readonly markups?: ReadonlyArray<Markup> | null;
    readonly commissions?: ReadonlyArray<Commission> | null;
    readonly promotions?: ReadonlyArray<Promotion> | null;
    readonly totals?: PricingTotal | null;
    readonly quote?: Quote | null;
}
export declare class PricingRequestValidator {
    validate(request: PricingValidationRequest): PricingValidationResult;
}
//# sourceMappingURL=pricing-request-validator.d.ts.map
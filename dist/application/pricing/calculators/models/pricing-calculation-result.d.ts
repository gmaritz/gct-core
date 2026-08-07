import { PricingBreakdown, PricingTotal } from "../../models";
export interface PricingCalculationResult {
    readonly breakdown: PricingBreakdown;
    readonly totals: PricingTotal;
    readonly warnings: ReadonlyArray<string>;
    readonly metadata: {
        readonly calculatedAt: Date;
        readonly version: string;
        readonly source: string;
        readonly calculatorsExecuted: ReadonlyArray<string>;
    };
}
export declare function createPricingCalculationResult(input: {
    readonly breakdown: PricingBreakdown;
    readonly totals: PricingTotal;
    readonly warnings?: ReadonlyArray<string>;
    readonly metadata: {
        readonly calculatedAt: Date;
        readonly version: string;
        readonly source: string;
        readonly calculatorsExecuted?: ReadonlyArray<string>;
    };
}): PricingCalculationResult;
//# sourceMappingURL=pricing-calculation-result.d.ts.map
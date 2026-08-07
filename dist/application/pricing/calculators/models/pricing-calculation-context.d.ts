import { Currency, PricingBreakdown, PricingTotal } from "../../models";
import { PricingStrategySet } from "../../policies";
import { PricingValidationRequest } from "../../validation";
import { PricingCalculatorStage } from "./pricing-calculator-stage";
export interface PricingCalculationContext {
    readonly pricingRequest: PricingValidationRequest;
    readonly pricingStrategySet: PricingStrategySet;
    readonly currentPricingBreakdown: PricingBreakdown;
    readonly calculatedTotals: PricingTotal;
    readonly currency: Currency;
    readonly warnings: ReadonlyArray<string>;
    readonly calculationMetadata: {
        readonly calculatedAt: Date;
        readonly version: string;
        readonly source: string;
        readonly currentStage?: PricingCalculatorStage;
    };
}
export declare function createPricingCalculationContext(context: PricingCalculationContext): PricingCalculationContext;
//# sourceMappingURL=pricing-calculation-context.d.ts.map
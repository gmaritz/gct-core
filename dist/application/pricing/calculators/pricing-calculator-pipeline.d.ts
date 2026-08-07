import { PricingCalculationContext, PricingCalculationResult } from "./models";
import { PricingCalculatorRegistry } from "./pricing-calculator-registry";
export declare class PricingCalculatorPipeline {
    private readonly registry;
    constructor(registry?: PricingCalculatorRegistry);
    execute(initialContext: PricingCalculationContext): PricingCalculationResult;
}
//# sourceMappingURL=pricing-calculator-pipeline.d.ts.map
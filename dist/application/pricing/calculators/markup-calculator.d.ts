import { PricingCalculationContext } from "./models";
import { PricingCalculator } from "./pricing-calculator";
export type MarkupCalculator = PricingCalculator & {
    calculate(context: PricingCalculationContext): PricingCalculationContext;
};
//# sourceMappingURL=markup-calculator.d.ts.map
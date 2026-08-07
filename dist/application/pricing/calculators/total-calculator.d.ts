import { PricingCalculationContext } from "./models";
import { PricingCalculator } from "./pricing-calculator";
export type TotalCalculator = PricingCalculator & {
    calculate(context: PricingCalculationContext): PricingCalculationContext;
};
//# sourceMappingURL=total-calculator.d.ts.map
import { PricingCalculationContext } from "./models";
import { PricingCalculator } from "./pricing-calculator";
export type CommissionCalculator = PricingCalculator & {
    calculate(context: PricingCalculationContext): PricingCalculationContext;
};
//# sourceMappingURL=commission-calculator.d.ts.map
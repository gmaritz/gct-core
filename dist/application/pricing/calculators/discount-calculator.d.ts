import { PricingCalculationContext } from "./models";
import { PricingCalculator } from "./pricing-calculator";
export type DiscountCalculator = PricingCalculator & {
    calculate(context: PricingCalculationContext): PricingCalculationContext;
};
//# sourceMappingURL=discount-calculator.d.ts.map
import { PricingCalculationContext } from "./models";
import { PricingCalculator } from "./pricing-calculator";
export type TaxCalculator = PricingCalculator & {
    calculate(context: PricingCalculationContext): PricingCalculationContext;
};
//# sourceMappingURL=tax-calculator.d.ts.map
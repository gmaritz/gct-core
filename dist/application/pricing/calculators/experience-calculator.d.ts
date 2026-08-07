import { PricingCalculationContext } from "./models";
import { PricingCalculator } from "./pricing-calculator";
export type ExperienceCalculator = PricingCalculator & {
    calculate(context: PricingCalculationContext): PricingCalculationContext;
};
//# sourceMappingURL=experience-calculator.d.ts.map
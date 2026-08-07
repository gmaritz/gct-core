import { PricingCalculationContext } from "./models";
import { PricingCalculator } from "./pricing-calculator";

export type ExperienceCalculator = PricingCalculator & {
  calculate(context: PricingCalculationContext): PricingCalculationContext;
};

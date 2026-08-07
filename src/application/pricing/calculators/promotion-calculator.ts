import { PricingCalculationContext } from "./models";
import { PricingCalculator } from "./pricing-calculator";

export type PromotionCalculator = PricingCalculator & {
  calculate(context: PricingCalculationContext): PricingCalculationContext;
};

import { PricingCalculationContext } from "./models";
import { PricingCalculator } from "./pricing-calculator";

export type AccommodationCalculator = PricingCalculator & {
  calculate(context: PricingCalculationContext): PricingCalculationContext;
};

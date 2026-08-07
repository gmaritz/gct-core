import { PricingCalculationContext, PricingCalculatorStage } from "./models";

export interface PricingCalculator {
  readonly stage: PricingCalculatorStage;
  calculate(context: PricingCalculationContext): PricingCalculationContext;
}

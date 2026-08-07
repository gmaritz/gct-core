import {
  createPricingCalculationContext,
  createPricingCalculationResult,
  PricingCalculationContext,
  PricingCalculationResult,
} from "./models";
import { PricingCalculatorRegistry } from "./pricing-calculator-registry";

export class PricingCalculatorPipeline {
  public constructor(private readonly registry: PricingCalculatorRegistry = new PricingCalculatorRegistry()) {}

  public execute(initialContext: PricingCalculationContext): PricingCalculationResult {
    let calculationContext = createPricingCalculationContext(initialContext);
    const executedCalculators: string[] = [];

    for (const registration of this.registry.resolveAll()) {
      const enrichedContext = registration.calculator.calculate(calculationContext);
      calculationContext = createPricingCalculationContext(enrichedContext);
      executedCalculators.push(registration.name);
    }

    return createPricingCalculationResult({
      breakdown: calculationContext.currentPricingBreakdown,
      totals: calculationContext.calculatedTotals,
      warnings: calculationContext.warnings,
      metadata: {
        calculatedAt: new Date(),
        version: "1.0.0",
        source: "PricingCalculatorPipeline",
        calculatorsExecuted: executedCalculators,
      },
    });
  }
}

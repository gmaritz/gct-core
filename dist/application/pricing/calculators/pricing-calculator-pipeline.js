"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingCalculatorPipeline = void 0;
const models_1 = require("./models");
const pricing_calculator_registry_1 = require("./pricing-calculator-registry");
class PricingCalculatorPipeline {
    constructor(registry = new pricing_calculator_registry_1.PricingCalculatorRegistry()) {
        this.registry = registry;
    }
    execute(initialContext) {
        let calculationContext = (0, models_1.createPricingCalculationContext)(initialContext);
        const executedCalculators = [];
        for (const registration of this.registry.resolveAll()) {
            const enrichedContext = registration.calculator.calculate(calculationContext);
            calculationContext = (0, models_1.createPricingCalculationContext)(enrichedContext);
            executedCalculators.push(registration.name);
        }
        return (0, models_1.createPricingCalculationResult)({
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
exports.PricingCalculatorPipeline = PricingCalculatorPipeline;
//# sourceMappingURL=pricing-calculator-pipeline.js.map
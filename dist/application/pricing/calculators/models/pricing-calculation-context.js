"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPricingCalculationContext = createPricingCalculationContext;
const models_1 = require("../../models");
const policies_1 = require("../../policies");
function createPricingCalculationContext(context) {
    return Object.freeze({
        pricingRequest: context.pricingRequest,
        pricingStrategySet: (0, policies_1.createPricingStrategySet)(context.pricingStrategySet),
        currentPricingBreakdown: (0, models_1.createPricingBreakdown)(context.currentPricingBreakdown),
        calculatedTotals: (0, models_1.createPricingTotal)(context.calculatedTotals),
        currency: context.currency,
        warnings: Object.freeze([...(context.warnings ?? [])]),
        calculationMetadata: Object.freeze({
            calculatedAt: new Date(context.calculationMetadata.calculatedAt.getTime()),
            version: context.calculationMetadata.version,
            source: context.calculationMetadata.source,
            currentStage: context.calculationMetadata.currentStage,
        }),
    });
}
//# sourceMappingURL=pricing-calculation-context.js.map
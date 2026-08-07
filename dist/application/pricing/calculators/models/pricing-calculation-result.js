"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPricingCalculationResult = createPricingCalculationResult;
const models_1 = require("../../models");
function createPricingCalculationResult(input) {
    return Object.freeze({
        breakdown: (0, models_1.createPricingBreakdown)(input.breakdown),
        totals: (0, models_1.createPricingTotal)(input.totals),
        warnings: Object.freeze([...(input.warnings ?? [])]),
        metadata: Object.freeze({
            calculatedAt: new Date(input.metadata.calculatedAt.getTime()),
            version: input.metadata.version,
            source: input.metadata.source,
            calculatorsExecuted: Object.freeze([...(input.metadata.calculatorsExecuted ?? [])]),
        }),
    });
}
//# sourceMappingURL=pricing-calculation-result.js.map
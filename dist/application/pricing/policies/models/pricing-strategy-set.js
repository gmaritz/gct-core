"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPricingStrategySet = createPricingStrategySet;
const pricing_strategy_1 = require("./pricing-strategy");
function createPricingStrategySet(input) {
    return Object.freeze({
        strategies: Object.freeze([...(input.strategies ?? []).map(pricing_strategy_1.createPricingStrategy)]),
        warnings: Object.freeze([...(input.warnings ?? [])]),
        metadata: Object.freeze({
            generatedAt: new Date(input.metadata.generatedAt.getTime()),
            version: input.metadata.version,
            source: input.metadata.source,
        }),
    });
}
//# sourceMappingURL=pricing-strategy-set.js.map
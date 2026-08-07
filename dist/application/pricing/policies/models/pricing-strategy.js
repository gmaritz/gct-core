"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPricingStrategy = createPricingStrategy;
function createPricingStrategy(strategy) {
    return Object.freeze({
        id: strategy.id,
        type: strategy.type,
        profile: strategy.profile,
        metadata: strategy.metadata ? Object.freeze({ ...strategy.metadata }) : undefined,
    });
}
//# sourceMappingURL=pricing-strategy.js.map
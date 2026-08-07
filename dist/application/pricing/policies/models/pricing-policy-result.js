"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPricingPolicyResult = createPricingPolicyResult;
const pricing_strategy_1 = require("./pricing-strategy");
function createPricingPolicyResult(input) {
    return Object.freeze({
        policyName: input.policyName,
        outcome: input.outcome,
        priority: input.priority,
        selectedStrategy: input.selectedStrategy ? (0, pricing_strategy_1.createPricingStrategy)(input.selectedStrategy) : undefined,
        warnings: Object.freeze([...(input.warnings ?? [])]),
        errors: Object.freeze([...(input.errors ?? [])]),
        metadata: Object.freeze({
            evaluatedAt: new Date(input.metadata.evaluatedAt.getTime()),
            version: input.metadata.version,
            source: input.metadata.source,
        }),
    });
}
//# sourceMappingURL=pricing-policy-result.js.map
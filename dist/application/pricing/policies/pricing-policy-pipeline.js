"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingPolicyPipeline = void 0;
const models_1 = require("./models");
const pricing_policy_registry_1 = require("./pricing-policy-registry");
function normalizeResult(result) {
    return (0, models_1.createPricingPolicyResult)({
        policyName: result.policyName,
        outcome: result.outcome,
        priority: result.priority,
        selectedStrategy: result.selectedStrategy,
        warnings: result.warnings,
        errors: result.errors,
        metadata: result.metadata,
    });
}
function aggregatePriority(results) {
    if (results.some((result) => result.priority === models_1.PricingPolicyPriority.CRITICAL)) {
        return models_1.PricingPolicyPriority.CRITICAL;
    }
    if (results.some((result) => result.priority === models_1.PricingPolicyPriority.HIGH)) {
        return models_1.PricingPolicyPriority.HIGH;
    }
    if (results.some((result) => result.priority === models_1.PricingPolicyPriority.NORMAL)) {
        return models_1.PricingPolicyPriority.NORMAL;
    }
    return models_1.PricingPolicyPriority.LOW;
}
function aggregateOutcome(results) {
    if (results.some((result) => result.outcome === models_1.PricingPolicyOutcome.DENY)) {
        return models_1.PricingPolicyOutcome.DENY;
    }
    if (results.some((result) => result.outcome === models_1.PricingPolicyOutcome.WARNING)) {
        return models_1.PricingPolicyOutcome.WARNING;
    }
    if (results.some((result) => result.outcome === models_1.PricingPolicyOutcome.APPLY)) {
        return models_1.PricingPolicyOutcome.APPLY;
    }
    return models_1.PricingPolicyOutcome.IGNORE;
}
class PricingPolicyPipeline {
    constructor(registry = new pricing_policy_registry_1.PricingPolicyRegistry()) {
        this.registry = registry;
    }
    evaluate(context) {
        const results = [];
        for (const registration of this.registry.resolveAll()) {
            const evaluation = normalizeResult(registration.policy.evaluate(context));
            results.push(evaluation);
            if (evaluation.outcome === models_1.PricingPolicyOutcome.DENY &&
                evaluation.priority === models_1.PricingPolicyPriority.CRITICAL) {
                break;
            }
        }
        const warnings = results.flatMap((result) => result.warnings);
        const errors = results.flatMap((result) => result.errors);
        const strategySet = (0, models_1.createPricingStrategySet)({
            strategies: results
                .filter((result) => typeof result.selectedStrategy !== "undefined")
                .map((result) => result.selectedStrategy),
            warnings,
            metadata: {
                generatedAt: new Date(),
                version: "1.0.0",
                source: "PricingPolicyPipeline",
            },
        });
        return Object.freeze({
            permitted: !results.some((result) => result.outcome === models_1.PricingPolicyOutcome.DENY),
            outcome: aggregateOutcome(results),
            priority: aggregatePriority(results),
            strategySet,
            policyResults: Object.freeze(results),
            errors: Object.freeze(errors),
            warnings: Object.freeze(warnings),
            metadata: Object.freeze({
                evaluatedAt: new Date(),
                version: "1.0.0",
                source: "PricingPolicyPipeline",
            }),
        });
    }
}
exports.PricingPolicyPipeline = PricingPolicyPipeline;
//# sourceMappingURL=pricing-policy-pipeline.js.map
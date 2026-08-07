"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentPolicyPipeline = void 0;
const models_1 = require("./models");
const payment_policy_registry_1 = require("./payment-policy-registry");
function normalizeResult(result) {
    return (0, models_1.createPaymentPolicyResult)({
        policyName: result.policyName,
        outcome: result.outcome,
        priority: result.priority,
        requiredActions: result.requiredActions,
        warnings: result.warnings,
        metadata: result.metadata,
    });
}
function aggregatePriority(results) {
    if (results.some((result) => result.priority === models_1.PaymentPolicyPriority.CRITICAL)) {
        return models_1.PaymentPolicyPriority.CRITICAL;
    }
    if (results.some((result) => result.priority === models_1.PaymentPolicyPriority.HIGH)) {
        return models_1.PaymentPolicyPriority.HIGH;
    }
    if (results.some((result) => result.priority === models_1.PaymentPolicyPriority.NORMAL)) {
        return models_1.PaymentPolicyPriority.NORMAL;
    }
    return models_1.PaymentPolicyPriority.LOW;
}
function aggregateOutcome(results) {
    if (results.some((result) => result.outcome === models_1.PaymentPolicyOutcome.DENY)) {
        return models_1.PaymentPolicyOutcome.DENY;
    }
    if (results.some((result) => result.outcome === models_1.PaymentPolicyOutcome.REQUIRE_ACTION)) {
        return models_1.PaymentPolicyOutcome.REQUIRE_ACTION;
    }
    return models_1.PaymentPolicyOutcome.ALLOW;
}
class PaymentPolicyPipeline {
    constructor(registry = new payment_policy_registry_1.PaymentPolicyRegistry()) {
        this.registry = registry;
    }
    evaluate(context) {
        const results = [];
        for (const registration of this.registry.resolveAll()) {
            const evaluation = normalizeResult(registration.policy.evaluate(context));
            results.push(evaluation);
            if (evaluation.outcome === models_1.PaymentPolicyOutcome.DENY) {
                break;
            }
        }
        const warnings = results.flatMap((result) => result.warnings);
        const requiredActions = results.flatMap((result) => result.requiredActions);
        return Object.freeze({
            permitted: !results.some((result) => result.outcome === models_1.PaymentPolicyOutcome.DENY),
            outcome: aggregateOutcome(results),
            priority: aggregatePriority(results),
            requiredActions: Object.freeze(requiredActions),
            policyResults: Object.freeze(results),
            warnings: Object.freeze(warnings),
            metadata: Object.freeze({
                evaluatedAt: new Date(),
                version: "1.0.0",
                source: "PaymentPolicyPipeline",
            }),
        });
    }
}
exports.PaymentPolicyPipeline = PaymentPolicyPipeline;
//# sourceMappingURL=payment-policy-pipeline.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoicePolicyPipeline = void 0;
const models_1 = require("./models");
const registry_1 = require("./registry");
function normalizeResult(result) {
    return (0, models_1.createInvoicePolicyResult)({
        policyName: result.policyName,
        outcome: result.outcome,
        priority: result.priority,
        requiredActions: result.requiredActions,
        errors: result.errors,
        warnings: result.warnings,
        observations: result.observations,
        metadata: result.metadata,
    });
}
function aggregatePriority(results) {
    if (results.some((result) => result.priority === models_1.InvoicePolicyPriority.CRITICAL)) {
        return models_1.InvoicePolicyPriority.CRITICAL;
    }
    if (results.some((result) => result.priority === models_1.InvoicePolicyPriority.HIGH)) {
        return models_1.InvoicePolicyPriority.HIGH;
    }
    if (results.some((result) => result.priority === models_1.InvoicePolicyPriority.NORMAL)) {
        return models_1.InvoicePolicyPriority.NORMAL;
    }
    return models_1.InvoicePolicyPriority.LOW;
}
function aggregateOutcome(results) {
    if (results.some((result) => result.outcome === models_1.InvoicePolicyOutcome.DENY)) {
        return models_1.InvoicePolicyOutcome.DENY;
    }
    if (results.some((result) => result.outcome === models_1.InvoicePolicyOutcome.REQUIRE_ACTION)) {
        return models_1.InvoicePolicyOutcome.REQUIRE_ACTION;
    }
    if (results.some((result) => result.outcome === models_1.InvoicePolicyOutcome.WARNING)) {
        return models_1.InvoicePolicyOutcome.WARNING;
    }
    if (results.some((result) => result.outcome === models_1.InvoicePolicyOutcome.ALLOW)) {
        return models_1.InvoicePolicyOutcome.ALLOW;
    }
    return models_1.InvoicePolicyOutcome.IGNORE;
}
class InvoicePolicyPipeline {
    constructor(registry = new registry_1.InvoicePolicyRegistry()) {
        this.registry = registry;
    }
    evaluate(context) {
        if (!context.validationResult.success) {
            const dependencyResult = (0, models_1.createInvoicePolicyResult)({
                policyName: "InvoiceValidationDependencyPolicy",
                outcome: models_1.InvoicePolicyOutcome.DENY,
                priority: models_1.InvoicePolicyPriority.CRITICAL,
                errors: ["Invoice policy evaluation requires a successful validation result."],
                observations: ["Policy evaluation aborted because invoice validation failed."],
                metadata: {
                    evaluatedAt: new Date(),
                    version: "1.0.0",
                    source: "InvoicePolicyPipeline",
                },
            });
            return this.aggregate([dependencyResult]);
        }
        const results = [];
        for (const registration of this.registry.resolveAll()) {
            const evaluation = normalizeResult(registration.policy.evaluate(context));
            results.push(evaluation);
            if (evaluation.outcome === models_1.InvoicePolicyOutcome.DENY && evaluation.priority === models_1.InvoicePolicyPriority.CRITICAL) {
                break;
            }
        }
        return this.aggregate(results);
    }
    aggregate(results) {
        const outcome = aggregateOutcome(results);
        const requiredActions = Object.freeze(results.flatMap((result) => result.requiredActions));
        const errors = Object.freeze(results.flatMap((result) => result.errors));
        const warnings = Object.freeze(results.flatMap((result) => result.warnings));
        const observations = Object.freeze(results.flatMap((result) => result.observations));
        return Object.freeze({
            permitted: !(outcome === models_1.InvoicePolicyOutcome.DENY || outcome === models_1.InvoicePolicyOutcome.REQUIRE_ACTION),
            outcome,
            priority: aggregatePriority(results),
            requiredActions,
            errors,
            warnings,
            observations,
            policyResults: Object.freeze([...results]),
            metadata: Object.freeze({
                evaluatedAt: new Date(),
                version: "1.0.0",
                source: "InvoicePolicyPipeline",
            }),
        });
    }
}
exports.InvoicePolicyPipeline = InvoicePolicyPipeline;
//# sourceMappingURL=invoice-policy-pipeline.js.map
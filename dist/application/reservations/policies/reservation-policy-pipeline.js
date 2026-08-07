"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationPolicyPipeline = void 0;
const models_1 = require("./models");
const reservation_policy_registry_1 = require("./reservation-policy-registry");
function normalizeResult(result) {
    return (0, models_1.createReservationPolicyResult)({
        permitted: result.permitted,
        outcome: result.outcome,
        priority: result.priority,
        errors: result.errors,
        warnings: result.warnings,
        observations: result.observations,
        metadata: result.metadata,
    });
}
function aggregateOutcome(results) {
    if (results.some((result) => result.outcome === models_1.ReservationPolicyOutcome.DENY)) {
        return models_1.ReservationPolicyOutcome.DENY;
    }
    if (results.some((result) => result.outcome === models_1.ReservationPolicyOutcome.WARNING)) {
        return models_1.ReservationPolicyOutcome.WARNING;
    }
    if (results.some((result) => result.outcome === models_1.ReservationPolicyOutcome.ALLOW)) {
        return models_1.ReservationPolicyOutcome.ALLOW;
    }
    return models_1.ReservationPolicyOutcome.IGNORE;
}
class ReservationPolicyPipeline {
    constructor(registry = new reservation_policy_registry_1.ReservationPolicyRegistry()) {
        this.registry = registry;
    }
    evaluate(context) {
        const results = [];
        for (const registration of this.registry.resolveAll()) {
            const evaluation = normalizeResult(registration.policy.evaluate(context));
            results.push(evaluation);
            if (evaluation.outcome === models_1.ReservationPolicyOutcome.DENY && evaluation.priority === models_1.ReservationPolicyPriority.CRITICAL) {
                break;
            }
        }
        const errors = results.flatMap((result) => result.errors);
        const warnings = results.flatMap((result) => result.warnings);
        const observations = results.flatMap((result) => result.observations);
        const permitted = !results.some((result) => result.outcome === models_1.ReservationPolicyOutcome.DENY);
        return (0, models_1.createReservationPolicyResult)({
            permitted,
            outcome: aggregateOutcome(results),
            priority: results.reduce((current, result) => {
                if (current === models_1.ReservationPolicyPriority.CRITICAL || result.priority === models_1.ReservationPolicyPriority.CRITICAL) {
                    return models_1.ReservationPolicyPriority.CRITICAL;
                }
                if (current === models_1.ReservationPolicyPriority.HIGH || result.priority === models_1.ReservationPolicyPriority.HIGH) {
                    return models_1.ReservationPolicyPriority.HIGH;
                }
                if (current === models_1.ReservationPolicyPriority.NORMAL || result.priority === models_1.ReservationPolicyPriority.NORMAL) {
                    return models_1.ReservationPolicyPriority.NORMAL;
                }
                return models_1.ReservationPolicyPriority.LOW;
            }, models_1.ReservationPolicyPriority.LOW),
            errors,
            warnings,
            observations,
            metadata: {
                evaluatedAt: new Date(),
                version: "1.0.0",
                source: "ReservationPolicyPipeline",
            },
        });
    }
}
exports.ReservationPolicyPipeline = ReservationPolicyPipeline;
//# sourceMappingURL=reservation-policy-pipeline.js.map
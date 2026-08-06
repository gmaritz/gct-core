"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyPolicyPipeline = void 0;
const models_1 = require("../models");
const registry_1 = require("../registry");
const models_2 = require("../models");
function normalizeResult(result) {
    return (0, models_2.createJourneyPolicyResult)(result.outcome, result.priority, result.messages);
}
class JourneyPolicyPipeline {
    constructor(registry = new registry_1.JourneyPolicyRegistry()) {
        this.registry = registry;
    }
    evaluate(context) {
        const results = [];
        for (const registration of this.registry.resolveAll()) {
            const evaluation = normalizeResult(registration.policy.evaluate(context));
            results.push(evaluation);
            if (evaluation.outcome === models_1.JourneyPolicyOutcome.DENY
                && evaluation.priority === models_1.JourneyPolicyPriority.CRITICAL) {
                break;
            }
        }
        return Object.freeze(results);
    }
}
exports.JourneyPolicyPipeline = JourneyPolicyPipeline;
//# sourceMappingURL=journey-policy-pipeline.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentPolicyResult = createPaymentPolicyResult;
function createPaymentPolicyResult(input) {
    return Object.freeze({
        policyName: input.policyName,
        outcome: input.outcome,
        priority: input.priority,
        requiredActions: Object.freeze([...(input.requiredActions ?? [])]),
        warnings: Object.freeze([...(input.warnings ?? [])]),
        metadata: Object.freeze({
            evaluatedAt: new Date(input.metadata.evaluatedAt.getTime()),
            version: input.metadata.version,
            source: input.metadata.source,
        }),
    });
}
//# sourceMappingURL=payment-policy-result.js.map
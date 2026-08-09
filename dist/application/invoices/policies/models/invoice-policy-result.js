"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoicePolicyResult = createInvoicePolicyResult;
function createInvoicePolicyResult(input) {
    return Object.freeze({
        policyName: input.policyName,
        outcome: input.outcome,
        priority: input.priority,
        requiredActions: Object.freeze([...(input.requiredActions ?? [])]),
        errors: Object.freeze([...(input.errors ?? [])]),
        warnings: Object.freeze([...(input.warnings ?? [])]),
        observations: Object.freeze([...(input.observations ?? [])]),
        metadata: Object.freeze({
            evaluatedAt: new Date(input.metadata.evaluatedAt.getTime()),
            version: input.metadata.version,
            source: input.metadata.source,
        }),
    });
}
//# sourceMappingURL=invoice-policy-result.js.map
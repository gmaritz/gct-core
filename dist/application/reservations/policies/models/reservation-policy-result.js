"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReservationPolicyResult = createReservationPolicyResult;
function createReservationPolicyResult(input) {
    return Object.freeze({
        permitted: input.permitted,
        outcome: input.outcome,
        priority: input.priority,
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
//# sourceMappingURL=reservation-policy-result.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentEngineResult = createPaymentEngineResult;
function createPaymentEngineResult(input) {
    return Object.freeze({
        success: input.success,
        payment: input.payment ?? null,
        validationResult: input.validationResult,
        policyEvaluation: input.policyEvaluation,
        processingResult: input.processingResult,
        metadata: Object.freeze({
            completedAt: new Date(input.metadata.completedAt.getTime()),
            version: input.metadata.version,
            requestId: input.metadata.requestId,
            source: input.metadata.source,
            stages: Object.freeze([...(input.metadata.stages ?? [])]),
            pending: input.metadata.pending,
        }),
    });
}
//# sourceMappingURL=payment-engine-result.js.map
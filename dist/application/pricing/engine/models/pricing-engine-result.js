"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPricingEngineResult = createPricingEngineResult;
function createPricingEngineResult(input) {
    return Object.freeze({
        successful: input.successful,
        pricing: input.pricing ?? null,
        warnings: Object.freeze([...(input.warnings ?? [])]),
        metadata: Object.freeze({
            completedAt: new Date(input.metadata.completedAt.getTime()),
            version: input.metadata.version,
            requestId: input.metadata.requestId,
            stages: Object.freeze([...(input.metadata.stages ?? [])]),
        }),
    });
}
//# sourceMappingURL=pricing-engine-result.js.map
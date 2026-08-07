"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPricingEngineContext = createPricingEngineContext;
exports.withEngineValidationResult = withEngineValidationResult;
exports.withEnginePolicyEvaluation = withEnginePolicyEvaluation;
exports.withEngineCalculationContext = withEngineCalculationContext;
exports.withEnginePricingAggregate = withEnginePricingAggregate;
const policies_1 = require("../../policies");
function cloneDate(value) {
    return new Date(value.getTime());
}
function deriveRequestId(request) {
    if (request.requestId && request.requestId.trim().length > 0) {
        return request.requestId.trim();
    }
    if (request.pricingRequest.quote?.id) {
        return request.pricingRequest.quote.id;
    }
    if (request.pricingRequest.summary?.productId) {
        return `pricing-${request.pricingRequest.summary.productId}`;
    }
    return "pricing-request";
}
function createPricingEngineContext(request) {
    return Object.freeze({
        pricingRequest: request.pricingRequest,
        pricingStrategySet: (0, policies_1.createPricingStrategySet)({
            strategies: [],
            warnings: [],
            metadata: {
                generatedAt: new Date(),
                version: "1.0.0",
                source: "PricingEngine",
            },
        }),
        metadata: Object.freeze({
            startedAt: new Date(),
            version: "1.0.0",
            requestId: deriveRequestId(request),
            stages: Object.freeze(["CONTEXT"]),
        }),
    });
}
function withStage(metadata, stage) {
    return Object.freeze({
        startedAt: cloneDate(metadata.startedAt),
        version: metadata.version,
        requestId: metadata.requestId,
        stages: Object.freeze([...metadata.stages, stage]),
    });
}
function withEngineValidationResult(context, validationResult) {
    return Object.freeze({
        ...context,
        validationResult,
        metadata: withStage(context.metadata, "VALIDATION"),
    });
}
function withEnginePolicyEvaluation(context, pricingPolicyEvaluation) {
    return Object.freeze({
        ...context,
        pricingPolicyEvaluation,
        pricingStrategySet: (0, policies_1.createPricingStrategySet)(pricingPolicyEvaluation.strategySet),
        metadata: withStage(context.metadata, "POLICY"),
    });
}
function withEngineCalculationContext(context, pricingCalculationContext) {
    return Object.freeze({
        ...context,
        pricingCalculationContext,
        metadata: withStage(context.metadata, "CALCULATION"),
    });
}
function withEnginePricingAggregate(context, pricingAggregate) {
    return Object.freeze({
        ...context,
        pricingAggregate,
        metadata: withStage(context.metadata, "AGGREGATE"),
    });
}
//# sourceMappingURL=pricing-engine-context.js.map
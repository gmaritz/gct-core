"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentExecutionContext = createPaymentExecutionContext;
exports.withExecutionValidationResult = withExecutionValidationResult;
exports.withExecutionPolicyEvaluation = withExecutionPolicyEvaluation;
exports.withExecutionProcessingResult = withExecutionProcessingResult;
exports.withExecutionPaymentAggregate = withExecutionPaymentAggregate;
const payment_engine_context_1 = require("./payment-engine-context");
function createPaymentExecutionContext(engineContext) {
    return Object.freeze({
        paymentRequest: engineContext.paymentRequest,
        paymentAggregate: null,
        metadata: engineContext.metadata,
    });
}
function withExecutionValidationResult(context, validationResult) {
    return Object.freeze({
        ...context,
        validationResult,
        metadata: (0, payment_engine_context_1.withEngineStage)(context.metadata, "VALIDATION"),
    });
}
function withExecutionPolicyEvaluation(context, policyEvaluation) {
    return Object.freeze({
        ...context,
        policyEvaluation,
        metadata: (0, payment_engine_context_1.withEngineStage)(context.metadata, "POLICY"),
    });
}
function withExecutionProcessingResult(context, processingResult) {
    return Object.freeze({
        ...context,
        processingResult,
        metadata: (0, payment_engine_context_1.withEngineStage)(context.metadata, "PROCESSING"),
    });
}
function withExecutionPaymentAggregate(context, paymentAggregate) {
    return Object.freeze({
        ...context,
        paymentAggregate,
        metadata: (0, payment_engine_context_1.withEngineStage)(context.metadata, "AGGREGATE"),
    });
}
//# sourceMappingURL=payment-execution-context.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentStageProcessingResult = createPaymentStageProcessingResult;
exports.createPaymentProcessingResult = createPaymentProcessingResult;
const payment_processing_context_1 = require("./payment-processing-context");
function createPaymentStageProcessingResult(result) {
    return Object.freeze({
        processorName: result.processorName,
        stage: result.stage,
        status: result.status,
        context: (0, payment_processing_context_1.createPaymentProcessingContext)(result.context),
        warnings: Object.freeze([...(result.warnings ?? [])]),
        metadata: Object.freeze({
            processedAt: new Date(result.metadata.processedAt.getTime()),
            version: result.metadata.version,
            source: result.metadata.source,
        }),
    });
}
function createPaymentProcessingResult(result) {
    return Object.freeze({
        success: result.success,
        stageResults: Object.freeze(result.stageResults.map(createPaymentStageProcessingResult)),
        finalContext: (0, payment_processing_context_1.createPaymentProcessingContext)(result.finalContext),
        warnings: Object.freeze([...(result.warnings ?? [])]),
        metadata: Object.freeze({
            processedAt: new Date(result.metadata.processedAt.getTime()),
            version: result.metadata.version,
            source: result.metadata.source,
        }),
    });
}
//# sourceMappingURL=payment-processing-result.js.map
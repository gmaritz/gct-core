"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProcessingPipeline = void 0;
const models_1 = require("./models");
const payment_processor_registry_1 = require("./payment-processor-registry");
function normalizeStageResult(result) {
    return (0, models_1.createPaymentStageProcessingResult)({
        processorName: result.processorName,
        stage: result.stage,
        status: result.status,
        context: result.context,
        warnings: result.warnings,
        metadata: result.metadata,
    });
}
class PaymentProcessingPipeline {
    constructor(registry = new payment_processor_registry_1.PaymentProcessorRegistry()) {
        this.registry = registry;
    }
    execute(context) {
        const stageResults = [];
        let currentContext = (0, models_1.createPaymentProcessingContext)(context);
        for (const registration of this.registry.resolveAll()) {
            const result = normalizeStageResult(registration.processor.process(currentContext));
            stageResults.push(result);
            currentContext = (0, models_1.createPaymentProcessingContext)(result.context);
            if (result.status === models_1.PaymentProcessingStatus.FAILED) {
                break;
            }
        }
        return (0, models_1.createPaymentProcessingResult)({
            success: !stageResults.some((result) => result.status === models_1.PaymentProcessingStatus.FAILED),
            stageResults,
            finalContext: currentContext,
            warnings: stageResults.flatMap((result) => result.warnings),
            metadata: {
                processedAt: new Date(),
                version: "1.0.0",
                source: "PaymentProcessingPipeline",
            },
        });
    }
}
exports.PaymentProcessingPipeline = PaymentProcessingPipeline;
//# sourceMappingURL=payment-processing-pipeline.js.map
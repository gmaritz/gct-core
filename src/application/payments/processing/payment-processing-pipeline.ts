import {
  createPaymentProcessingContext,
  createPaymentProcessingResult,
  createPaymentStageProcessingResult,
  PaymentProcessingContext,
  PaymentProcessingResult,
  PaymentProcessingStatus,
  PaymentStageProcessingResult,
} from "./models";
import { PaymentProcessorRegistry } from "./payment-processor-registry";

function normalizeStageResult(result: PaymentStageProcessingResult): PaymentStageProcessingResult {
  return createPaymentStageProcessingResult({
    processorName: result.processorName,
    stage: result.stage,
    status: result.status,
    context: result.context,
    warnings: result.warnings,
    metadata: result.metadata,
  });
}

export class PaymentProcessingPipeline {
  public constructor(private readonly registry: PaymentProcessorRegistry = new PaymentProcessorRegistry()) {}

  public execute(context: PaymentProcessingContext): PaymentProcessingResult {
    const stageResults: PaymentStageProcessingResult[] = [];
    let currentContext = createPaymentProcessingContext(context);

    for (const registration of this.registry.resolveAll()) {
      const result = normalizeStageResult(registration.processor.process(currentContext));
      stageResults.push(result);
      currentContext = createPaymentProcessingContext(result.context);

      if (result.status === PaymentProcessingStatus.FAILED) {
        break;
      }
    }

    return createPaymentProcessingResult({
      success: !stageResults.some((result) => result.status === PaymentProcessingStatus.FAILED),
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

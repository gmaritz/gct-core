import { PaymentProcessingContext, createPaymentProcessingContext } from "./payment-processing-context";
import { PaymentProcessingStage } from "./payment-processing-stage";
import { PaymentProcessingStatus } from "./payment-processing-status";

export interface PaymentStageProcessingResult {
  readonly processorName: string;
  readonly stage: PaymentProcessingStage;
  readonly status: PaymentProcessingStatus;
  readonly context: PaymentProcessingContext;
  readonly warnings: ReadonlyArray<string>;
  readonly metadata: {
    readonly processedAt: Date;
    readonly version: string;
    readonly source: string;
  };
}

export interface PaymentProcessingResult {
  readonly success: boolean;
  readonly stageResults: ReadonlyArray<PaymentStageProcessingResult>;
  readonly finalContext: PaymentProcessingContext;
  readonly warnings: ReadonlyArray<string>;
  readonly metadata: {
    readonly processedAt: Date;
    readonly version: string;
    readonly source: string;
  };
}

export function createPaymentStageProcessingResult(result: PaymentStageProcessingResult): PaymentStageProcessingResult {
  return Object.freeze({
    processorName: result.processorName,
    stage: result.stage,
    status: result.status,
    context: createPaymentProcessingContext(result.context),
    warnings: Object.freeze([...(result.warnings ?? [])]),
    metadata: Object.freeze({
      processedAt: new Date(result.metadata.processedAt.getTime()),
      version: result.metadata.version,
      source: result.metadata.source,
    }),
  });
}

export function createPaymentProcessingResult(result: PaymentProcessingResult): PaymentProcessingResult {
  return Object.freeze({
    success: result.success,
    stageResults: Object.freeze(result.stageResults.map(createPaymentStageProcessingResult)),
    finalContext: createPaymentProcessingContext(result.finalContext),
    warnings: Object.freeze([...(result.warnings ?? [])]),
    metadata: Object.freeze({
      processedAt: new Date(result.metadata.processedAt.getTime()),
      version: result.metadata.version,
      source: result.metadata.source,
    }),
  });
}

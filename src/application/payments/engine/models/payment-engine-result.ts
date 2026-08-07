import { Payment } from "../../aggregate";
import { PaymentPolicyEvaluation } from "../../policies";
import { PaymentProcessingResult } from "../../processing";
import { PaymentValidationResult } from "../../validation";

export interface PaymentEngineResult {
  readonly success: boolean;
  readonly payment: Payment | null;
  readonly validationResult: PaymentValidationResult;
  readonly policyEvaluation?: PaymentPolicyEvaluation;
  readonly processingResult?: PaymentProcessingResult;
  readonly metadata: {
    readonly completedAt: Date;
    readonly version: string;
    readonly requestId: string;
    readonly source: string;
    readonly stages: ReadonlyArray<string>;
    readonly pending: boolean;
  };
}

export function createPaymentEngineResult(input: {
  readonly success: boolean;
  readonly payment?: Payment | null;
  readonly validationResult: PaymentValidationResult;
  readonly policyEvaluation?: PaymentPolicyEvaluation;
  readonly processingResult?: PaymentProcessingResult;
  readonly metadata: {
    readonly completedAt: Date;
    readonly version: string;
    readonly requestId: string;
    readonly source: string;
    readonly stages: ReadonlyArray<string>;
    readonly pending: boolean;
  };
}): PaymentEngineResult {
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

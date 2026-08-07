import { Payment } from "../../aggregate";
import { PaymentPolicyEvaluation } from "../../policies";
import { PaymentProcessingResult } from "../../processing";
import { PaymentValidationResult } from "../../validation";
import {
  PaymentEngineContext,
  PaymentEngineContextMetadata,
  withEngineStage,
} from "./payment-engine-context";

export interface PaymentExecutionContext {
  readonly paymentRequest: PaymentEngineContext["paymentRequest"];
  readonly validationResult?: PaymentValidationResult;
  readonly policyEvaluation?: PaymentPolicyEvaluation;
  readonly processingResult?: PaymentProcessingResult;
  readonly paymentAggregate?: Payment | null;
  readonly metadata: PaymentEngineContextMetadata;
}

export function createPaymentExecutionContext(engineContext: PaymentEngineContext): PaymentExecutionContext {
  return Object.freeze({
    paymentRequest: engineContext.paymentRequest,
    paymentAggregate: null,
    metadata: engineContext.metadata,
  });
}

export function withExecutionValidationResult(
  context: PaymentExecutionContext,
  validationResult: PaymentValidationResult,
): PaymentExecutionContext {
  return Object.freeze({
    ...context,
    validationResult,
    metadata: withEngineStage(context.metadata, "VALIDATION"),
  });
}

export function withExecutionPolicyEvaluation(
  context: PaymentExecutionContext,
  policyEvaluation: PaymentPolicyEvaluation,
): PaymentExecutionContext {
  return Object.freeze({
    ...context,
    policyEvaluation,
    metadata: withEngineStage(context.metadata, "POLICY"),
  });
}

export function withExecutionProcessingResult(
  context: PaymentExecutionContext,
  processingResult: PaymentProcessingResult,
): PaymentExecutionContext {
  return Object.freeze({
    ...context,
    processingResult,
    metadata: withEngineStage(context.metadata, "PROCESSING"),
  });
}

export function withExecutionPaymentAggregate(
  context: PaymentExecutionContext,
  paymentAggregate: Payment,
): PaymentExecutionContext {
  return Object.freeze({
    ...context,
    paymentAggregate,
    metadata: withEngineStage(context.metadata, "AGGREGATE"),
  });
}

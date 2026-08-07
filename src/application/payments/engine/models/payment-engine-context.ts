import { PaymentValidationRequest } from "../../validation";

export interface PaymentEngineRequest {
  readonly paymentRequest: PaymentValidationRequest;
  readonly requestId?: string;
  readonly source?: string;
}

export interface PaymentEngineContextMetadata {
  readonly startedAt: Date;
  readonly version: string;
  readonly requestId: string;
  readonly source: string;
  readonly stages: ReadonlyArray<string>;
}

export interface PaymentEngineContext {
  readonly paymentRequest: PaymentValidationRequest;
  readonly metadata: PaymentEngineContextMetadata;
}

function cloneDate(value: Date): Date {
  return new Date(value.getTime());
}

function deriveRequestId(request: PaymentEngineRequest): string {
  if (request.requestId && request.requestId.trim().length > 0) {
    return request.requestId.trim();
  }

  if (request.paymentRequest.reference?.paymentId) {
    return request.paymentRequest.reference.paymentId;
  }

  if (request.paymentRequest.gatewayContext?.requestId) {
    return request.paymentRequest.gatewayContext.requestId;
  }

  return "payment-request";
}

export function createPaymentEngineContext(request: PaymentEngineRequest): PaymentEngineContext {
  return Object.freeze({
    paymentRequest: request.paymentRequest,
    metadata: Object.freeze({
      startedAt: new Date(),
      version: "1.0.0",
      requestId: deriveRequestId(request),
      source: request.source ?? "PaymentEngine",
      stages: Object.freeze(["CONTEXT"]),
    }),
  });
}

export function withEngineStage(
  metadata: PaymentEngineContextMetadata,
  stage: string,
): PaymentEngineContextMetadata {
  return Object.freeze({
    startedAt: cloneDate(metadata.startedAt),
    version: metadata.version,
    requestId: metadata.requestId,
    source: metadata.source,
    stages: Object.freeze([...metadata.stages, stage]),
  });
}

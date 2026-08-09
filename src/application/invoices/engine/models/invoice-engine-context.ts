import { Invoice } from "../../aggregate";
import { InvoiceOperation, InvoicePolicyEvaluation } from "../../policies";
import { InvoiceValidationResult, InvoiceValidationRequest } from "../../validation";
import { InvoiceOperationInput } from "./invoice-operation-input";

export interface InvoiceEngineRequest {
  readonly operation: InvoiceOperation;
  readonly validationRequest: InvoiceValidationRequest;
  readonly validationResult: InvoiceValidationResult;
  readonly policyEvaluation: InvoicePolicyEvaluation;
  readonly operationInput?: InvoiceOperationInput;
  readonly invoice?: Invoice | null;
  readonly requestId?: string;
  readonly source?: string;
}

export interface InvoiceEngineContextMetadata {
  readonly startedAt: Date;
  readonly version: string;
  readonly requestId: string;
  readonly source: string;
  readonly stages: ReadonlyArray<string>;
}

export interface InvoiceEngineContext {
  readonly operation: InvoiceOperation;
  readonly validationRequest: InvoiceValidationRequest;
  readonly validationResult: InvoiceValidationResult;
  readonly policyEvaluation: InvoicePolicyEvaluation;
  readonly operationInput?: InvoiceOperationInput;
  readonly invoice?: Invoice | null;
  readonly metadata: InvoiceEngineContextMetadata;
}

function cloneDate(value: Date): Date {
  return new Date(value.getTime());
}

function deriveRequestId(request: InvoiceEngineRequest): string {
  if (request.requestId && request.requestId.trim().length > 0) {
    return request.requestId.trim();
  }

  if (request.invoice?.identity.id) {
    return request.invoice.identity.id;
  }

  if (request.validationRequest.invoice?.identity.id) {
    return request.validationRequest.invoice.identity.id;
  }

  if (request.operationInput?.operation === InvoiceOperation.CREATE) {
    return request.operationInput.composition.identity.id;
  }

  return "invoice-request";
}

export function createInvoiceEngineContext(request: InvoiceEngineRequest): InvoiceEngineContext {
  return Object.freeze({
    operation: request.operation,
    validationRequest: request.validationRequest,
    validationResult: request.validationResult,
    policyEvaluation: request.policyEvaluation,
    operationInput: request.operationInput,
    invoice: request.invoice ?? request.validationRequest.invoice ?? null,
    metadata: Object.freeze({
      startedAt: new Date(),
      version: "1.0.0",
      requestId: deriveRequestId(request),
      source: request.source ?? "InvoiceEngine",
      stages: Object.freeze(["CONTEXT"]),
    }),
  });
}

export function withInvoiceEngineStage(metadata: InvoiceEngineContextMetadata, stage: string): InvoiceEngineContextMetadata {
  return Object.freeze({
    startedAt: cloneDate(metadata.startedAt),
    version: metadata.version,
    requestId: metadata.requestId,
    source: metadata.source,
    stages: Object.freeze([...metadata.stages, stage]),
  });
}

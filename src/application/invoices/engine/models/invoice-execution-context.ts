import { Invoice } from "../../aggregate";
import {
  InvoiceEngineContext,
  InvoiceEngineContextMetadata,
  withInvoiceEngineStage,
} from "./invoice-engine-context";

export interface InvoiceExecutionContext {
  readonly operation: InvoiceEngineContext["operation"];
  readonly validationRequest: InvoiceEngineContext["validationRequest"];
  readonly validationResult: InvoiceEngineContext["validationResult"];
  readonly policyEvaluation: InvoiceEngineContext["policyEvaluation"];
  readonly operationInput?: InvoiceEngineContext["operationInput"];
  readonly invoice?: Invoice | null;
  readonly resultingInvoice?: Invoice | null;
  readonly metadata: InvoiceEngineContextMetadata;
}

export function createInvoiceExecutionContext(engineContext: InvoiceEngineContext): InvoiceExecutionContext {
  return Object.freeze({
    operation: engineContext.operation,
    validationRequest: engineContext.validationRequest,
    validationResult: engineContext.validationResult,
    policyEvaluation: engineContext.policyEvaluation,
    operationInput: engineContext.operationInput,
    invoice: engineContext.invoice,
    resultingInvoice: null,
    metadata: engineContext.metadata,
  });
}

export function withExecutionResultingInvoice(
  context: InvoiceExecutionContext,
  resultingInvoice: Invoice,
): InvoiceExecutionContext {
  return Object.freeze({
    ...context,
    resultingInvoice,
    metadata: withInvoiceEngineStage(context.metadata, "OPERATION"),
  });
}

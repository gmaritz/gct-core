import { InvoiceValidationErrorCode } from "./invoice-validation-error-code";
import { InvoiceValidationStage } from "./invoice-validation-stage";

export type InvoiceValidationSeverity = "CRITICAL" | "WARNING";

export interface InvoiceValidationError {
  readonly stage: InvoiceValidationStage;
  readonly code: InvoiceValidationErrorCode;
  readonly message: string;
  readonly severity: InvoiceValidationSeverity;
}

export function createInvoiceValidationError(error: InvoiceValidationError): InvoiceValidationError {
  return Object.freeze({
    stage: error.stage,
    code: error.code,
    message: error.message,
    severity: error.severity,
  });
}
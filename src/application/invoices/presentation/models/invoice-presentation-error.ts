export enum InvoicePresentationErrorCode {
  MISSING_INPUT = "MISSING_INPUT",
  MISSING_INVOICE = "MISSING_INVOICE",
  ENGINE_RESULT_FAILED = "ENGINE_RESULT_FAILED",
}

export interface InvoicePresentationError {
  readonly code: InvoicePresentationErrorCode;
  readonly message: string;
}

export function createInvoicePresentationError(error: InvoicePresentationError): InvoicePresentationError {
  return Object.freeze({
    code: error.code,
    message: error.message,
  });
}

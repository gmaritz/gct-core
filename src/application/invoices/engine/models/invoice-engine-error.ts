export enum InvoiceEngineErrorCode {
  VALIDATION_FAILED = "VALIDATION_FAILED",
  POLICY_DENIED = "POLICY_DENIED",
  POLICY_ACTION_REQUIRED = "POLICY_ACTION_REQUIRED",
  MISSING_INVOICE = "MISSING_INVOICE",
  INVALID_OPERATION = "INVALID_OPERATION",
  INVALID_OPERATION_INPUT = "INVALID_OPERATION_INPUT",
  CALCULATION_ERROR = "CALCULATION_ERROR",
  DUPLICATE_PAYMENT_ALLOCATION = "DUPLICATE_PAYMENT_ALLOCATION",
  CURRENCY_MISMATCH = "CURRENCY_MISMATCH",
}

export interface InvoiceEngineError {
  readonly code: InvoiceEngineErrorCode;
  readonly message: string;
}

export function createInvoiceEngineError(error: InvoiceEngineError): InvoiceEngineError {
  return Object.freeze({
    code: error.code,
    message: error.message,
  });
}

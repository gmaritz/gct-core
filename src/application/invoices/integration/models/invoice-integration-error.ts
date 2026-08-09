export enum InvoiceIntegrationErrorCode {
  CONFIGURATION_ERROR = "CONFIGURATION_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  PROVIDER_REJECTION = "PROVIDER_REJECTION",
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT = "TIMEOUT",
  RATE_LIMITED = "RATE_LIMITED",
  DUPLICATE_REQUEST = "DUPLICATE_REQUEST",
  UNKNOWN_EXTERNAL_ERROR = "UNKNOWN_EXTERNAL_ERROR",
}

export interface InvoiceIntegrationError {
  readonly code: InvoiceIntegrationErrorCode;
  readonly message: string;
  readonly retryable: boolean;
  readonly providerCode?: string;
}

export function createInvoiceIntegrationError(error: InvoiceIntegrationError): InvoiceIntegrationError {
  return Object.freeze({
    code: error.code,
    message: error.message,
    retryable: error.retryable,
    providerCode: error.providerCode,
  });
}

export enum HotelbedsIntegrationErrorCode {
  CONFIGURATION_ERROR = "CONFIGURATION_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  RATE_LIMITED = "RATE_LIMITED",
  TIMEOUT = "TIMEOUT",
  NETWORK_ERROR = "NETWORK_ERROR",
  PROVIDER_ERROR = "PROVIDER_ERROR",
  MALFORMED_RESPONSE = "MALFORMED_RESPONSE",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export interface HotelbedsIntegrationError {
  readonly code: HotelbedsIntegrationErrorCode;
  readonly message: string;
  readonly retryable: boolean;
  readonly providerCode?: string;
  readonly httpStatus?: number;
}

export function createHotelbedsIntegrationError(error: HotelbedsIntegrationError): HotelbedsIntegrationError {
  return Object.freeze({
    code: error.code,
    message: error.message,
    retryable: error.retryable,
    providerCode: error.providerCode,
    httpStatus: error.httpStatus,
  });
}
import {
  HotelbedsConfigurationError,
} from "./hotelbeds-integration-config";
import {
  createHotelbedsIntegrationError,
  HotelbedsIntegrationError,
  HotelbedsIntegrationErrorCode,
} from "./hotelbeds-integration-error";
import {
  HotelbedsTransportError,
  HotelbedsTransportErrorKind,
} from "./hotelbeds-transport";

interface ProviderFailurePayload {
  readonly error?: {
    readonly code?: string;
    readonly message?: string;
  };
  readonly code?: string;
  readonly message?: string;
}

function mapHttpStatusToCode(status: number): {
  readonly code: HotelbedsIntegrationErrorCode;
  readonly retryable: boolean;
} {
  if (status === 400 || status === 422) {
    return { code: HotelbedsIntegrationErrorCode.VALIDATION_ERROR, retryable: false };
  }

  if (status === 401) {
    return { code: HotelbedsIntegrationErrorCode.AUTHENTICATION_ERROR, retryable: false };
  }

  if (status === 403) {
    return { code: HotelbedsIntegrationErrorCode.AUTHORIZATION_ERROR, retryable: false };
  }

  if (status === 404) {
    return { code: HotelbedsIntegrationErrorCode.NOT_FOUND, retryable: false };
  }

  if (status === 429) {
    return { code: HotelbedsIntegrationErrorCode.RATE_LIMITED, retryable: true };
  }

  if (status >= 500) {
    return { code: HotelbedsIntegrationErrorCode.PROVIDER_ERROR, retryable: true };
  }

  return { code: HotelbedsIntegrationErrorCode.UNKNOWN_ERROR, retryable: false };
}

function readProviderError(payload: unknown): { readonly code?: string; readonly message?: string } {
  if (!payload || typeof payload !== "object") {
    return {};
  }

  const providerPayload = payload as ProviderFailurePayload;
  return {
    code: providerPayload.error?.code ?? providerPayload.code,
    message: providerPayload.error?.message ?? providerPayload.message,
  };
}

export function mapHotelbedsHttpError(status: number, payload: unknown): HotelbedsIntegrationError {
  const mapping = mapHttpStatusToCode(status);
  const providerError = readProviderError(payload);

  return createHotelbedsIntegrationError({
    code: mapping.code,
    retryable: mapping.retryable,
    providerCode: providerError.code,
    httpStatus: status,
    message: providerError.message ?? `Hotelbeds request failed with status ${status}.`,
  });
}

export function mapHotelbedsTransportError(error: unknown): HotelbedsIntegrationError {
  if (error instanceof HotelbedsConfigurationError) {
    return createHotelbedsIntegrationError({
      code: HotelbedsIntegrationErrorCode.CONFIGURATION_ERROR,
      retryable: false,
      message: error.message,
    });
  }

  if (!(error instanceof HotelbedsTransportError)) {
    const message = error instanceof Error ? error.message : "Unknown Hotelbeds transport failure.";
    return createHotelbedsIntegrationError({
      code: HotelbedsIntegrationErrorCode.UNKNOWN_ERROR,
      retryable: false,
      message,
    });
  }

  if (error.kind === HotelbedsTransportErrorKind.TIMEOUT) {
    return createHotelbedsIntegrationError({
      code: HotelbedsIntegrationErrorCode.TIMEOUT,
      retryable: true,
      providerCode: error.providerCode,
      message: error.message,
    });
  }

  if (error.kind === HotelbedsTransportErrorKind.NETWORK) {
    return createHotelbedsIntegrationError({
      code: HotelbedsIntegrationErrorCode.NETWORK_ERROR,
      retryable: true,
      providerCode: error.providerCode,
      message: error.message,
    });
  }

  if (error.kind === HotelbedsTransportErrorKind.MALFORMED_RESPONSE) {
    return createHotelbedsIntegrationError({
      code: HotelbedsIntegrationErrorCode.MALFORMED_RESPONSE,
      retryable: false,
      providerCode: error.providerCode,
      message: error.message,
    });
  }

  return createHotelbedsIntegrationError({
    code: HotelbedsIntegrationErrorCode.UNKNOWN_ERROR,
    retryable: false,
    providerCode: error.providerCode,
    message: error.message,
  });
}
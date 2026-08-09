import {
  createHotelbedsIntegrationError,
  HotelbedsIntegrationError,
} from "./hotelbeds-integration-error";

export interface HotelbedsProviderResponseSummary {
  readonly status: number;
  readonly payloadType: "object" | "array" | "none";
}

export interface HotelbedsIntegrationResultMetadata {
  readonly completedAt: Date;
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly durationMs?: number;
}

export interface HotelbedsIntegrationResult<T> {
  readonly success: boolean;
  readonly operation: string;
  readonly provider: "hotelbeds";
  readonly retryable: boolean;
  readonly data: T | null;
  readonly errors: ReadonlyArray<HotelbedsIntegrationError>;
  readonly providerResponse?: HotelbedsProviderResponseSummary;
  readonly metadata: HotelbedsIntegrationResultMetadata;
}

function cloneSummary(
  summary: HotelbedsProviderResponseSummary | undefined,
): HotelbedsProviderResponseSummary | undefined {
  if (!summary) {
    return undefined;
  }

  return Object.freeze({
    status: summary.status,
    payloadType: summary.payloadType,
  });
}

export function createHotelbedsIntegrationResult<T>(
  result: HotelbedsIntegrationResult<T>,
): HotelbedsIntegrationResult<T> {
  return Object.freeze({
    success: result.success,
    operation: result.operation,
    provider: "hotelbeds",
    retryable: result.retryable,
    data: result.data ?? null,
    errors: Object.freeze([...(result.errors ?? []).map(createHotelbedsIntegrationError)]),
    providerResponse: cloneSummary(result.providerResponse),
    metadata: Object.freeze({
      completedAt: new Date(result.metadata.completedAt.getTime()),
      requestId: result.metadata.requestId,
      correlationId: result.metadata.correlationId,
      durationMs: result.metadata.durationMs,
    }),
  });
}
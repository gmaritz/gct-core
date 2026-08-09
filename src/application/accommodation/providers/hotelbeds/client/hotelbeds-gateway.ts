import {
  DefaultHotelbedsAuthentication,
  HotelbedsAuthentication,
} from "./hotelbeds-authentication";
import {
  HotelbedsIntegrationConfig,
  loadHotelbedsIntegrationConfig,
} from "./hotelbeds-integration-config";
import {
  createHotelbedsIntegrationError,
  HotelbedsIntegrationErrorCode,
} from "./hotelbeds-integration-error";
import {
  createHotelbedsIntegrationResult,
  HotelbedsIntegrationResult,
  HotelbedsProviderResponseSummary,
} from "./hotelbeds-integration-result";
import {
  mapHotelbedsHttpError,
  mapHotelbedsTransportError,
} from "./hotelbeds-error-mapper";
import { HotelbedsRequest } from "./hotelbeds-request";
import {
  FetchHotelbedsTransport,
  HotelbedsTransport,
  HotelbedsTransportResponse,
} from "./hotelbeds-transport";

export interface HotelbedsGateway {
  execute<T>(request: HotelbedsRequest): Promise<HotelbedsIntegrationResult<T>>;
}

function payloadType(payload: unknown): HotelbedsProviderResponseSummary["payloadType"] {
  if (payload === undefined) {
    return "none";
  }

  if (Array.isArray(payload)) {
    return "array";
  }

  if (typeof payload === "object" && payload !== null) {
    return "object";
  }

  return "none";
}

function isUsableSuccessPayload(payload: unknown): boolean {
  if (payload === undefined) {
    return true;
  }

  if (Array.isArray(payload)) {
    return true;
  }

  return typeof payload === "object" && payload !== null;
}

function createProviderSummary(response: HotelbedsTransportResponse): HotelbedsProviderResponseSummary {
  return {
    status: response.status,
    payloadType: payloadType(response.body),
  };
}

export class DefaultHotelbedsGateway implements HotelbedsGateway {
  public constructor(
    private readonly configLoader: () => HotelbedsIntegrationConfig = () =>
      loadHotelbedsIntegrationConfig(),
    private readonly authentication: HotelbedsAuthentication = new DefaultHotelbedsAuthentication(),
    private readonly transport: HotelbedsTransport = new FetchHotelbedsTransport(),
  ) {}

  public async execute<T>(request: HotelbedsRequest): Promise<HotelbedsIntegrationResult<T>> {
    const completedAt = new Date();

    try {
      const config = this.configLoader();
      const headers = this.authentication.prepareHeaders(request, {
        correlationId: request.correlationId,
        requestId: request.requestId,
      });

      const response = await this.transport.execute(config, {
        method: request.method,
        path: request.path,
        query: request.query,
        body: request.body,
        headers,
      });

      if (response.status >= 200 && response.status < 300) {
        if (!isUsableSuccessPayload(response.body)) {
          return createHotelbedsIntegrationResult<T>({
            success: false,
            operation: request.operation,
            provider: "hotelbeds",
            retryable: false,
            data: null,
            errors: [
              createHotelbedsIntegrationError({
                code: HotelbedsIntegrationErrorCode.MALFORMED_RESPONSE,
                retryable: false,
                httpStatus: response.status,
                message: "Hotelbeds success response payload is malformed.",
              }),
            ],
            providerResponse: createProviderSummary(response),
            metadata: {
              completedAt,
              requestId: request.requestId,
              correlationId: request.correlationId,
              durationMs: response.durationMs,
            },
          });
        }

        return createHotelbedsIntegrationResult<T>({
          success: true,
          operation: request.operation,
          provider: "hotelbeds",
          retryable: false,
          data: response.body as T,
          errors: [],
          providerResponse: createProviderSummary(response),
          metadata: {
            completedAt,
            requestId: request.requestId,
            correlationId: request.correlationId,
            durationMs: response.durationMs,
          },
        });
      }

      const mappedError = mapHotelbedsHttpError(response.status, response.body);
      return createHotelbedsIntegrationResult<T>({
        success: false,
        operation: request.operation,
        provider: "hotelbeds",
        retryable: mappedError.retryable,
        data: null,
        errors: [mappedError],
        providerResponse: createProviderSummary(response),
        metadata: {
          completedAt,
          requestId: request.requestId,
          correlationId: request.correlationId,
          durationMs: response.durationMs,
        },
      });
    } catch (error) {
      const mappedError = mapHotelbedsTransportError(error);

      return createHotelbedsIntegrationResult<T>({
        success: false,
        operation: request.operation,
        provider: "hotelbeds",
        retryable: mappedError.retryable,
        data: null,
        errors: [mappedError],
        metadata: {
          completedAt,
          requestId: request.requestId,
          correlationId: request.correlationId,
        },
      });
    }
  }
}
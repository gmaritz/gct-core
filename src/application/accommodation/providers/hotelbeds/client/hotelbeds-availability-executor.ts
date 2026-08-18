import {
  DefaultHotelbedsAuthentication,
  HotelbedsAuthentication,
} from "./hotelbeds-authentication";
import { HotelbedsAvailabilityRequest } from "./hotelbeds-availability-request";
import {
  createHotelbedsAvailabilityExecutionResult,
  HotelbedsAvailabilityExecutionResult,
  HotelbedsAvailabilityRawResponse,
  HotelbedsAvailabilitySupplierError,
  HotelbedsAvailabilityTransportFailure,
} from "./hotelbeds-availability-execution-result";
import {
  mapHotelbedsHttpError,
  mapHotelbedsTransportError,
} from "./hotelbeds-error-mapper";
import {
  createHotelbedsIntegrationError,
  HotelbedsIntegrationError,
  HotelbedsIntegrationErrorCode,
} from "./hotelbeds-integration-error";
import {
  HotelbedsIntegrationConfig,
  loadHotelbedsIntegrationConfig,
} from "./hotelbeds-integration-config";
import {
  FetchHotelbedsTransport,
  HotelbedsTransport,
  HotelbedsTransportError,
} from "./hotelbeds-transport";

export interface HotelbedsAvailabilityExecutor {
  execute(
    requests: ReadonlyArray<HotelbedsAvailabilityRequest>,
  ): Promise<HotelbedsAvailabilityExecutionResult>;
}

interface ProviderFailurePayload {
  readonly error?: {
    readonly code?: string;
    readonly message?: string;
  };
  readonly code?: string;
  readonly message?: string;
}

interface HotelbedsAvailabilityExecutorOptions {
  readonly maxAttempts: number;
}

const DEFAULT_EXECUTOR_OPTIONS: HotelbedsAvailabilityExecutorOptions = Object.freeze({
  maxAttempts: 3,
});

function readSupplierError(payload: unknown): HotelbedsAvailabilitySupplierError | undefined {
  if (!payload || typeof payload !== "object") {
    return undefined;
  }

  const providerPayload = payload as ProviderFailurePayload;
  const code = providerPayload.error?.code ?? providerPayload.code;
  const message = providerPayload.error?.message ?? providerPayload.message;

  if (!code && !message) {
    return undefined;
  }

  return {
    code,
    message,
    payload,
  };
}

function createTransportFailure(error: unknown): HotelbedsAvailabilityTransportFailure {
  if (error instanceof HotelbedsTransportError) {
    return {
      kind: error.kind,
      message: error.message,
      providerCode: error.providerCode,
    };
  }

  return {
    kind: "UNKNOWN",
    message: error instanceof Error ? error.message : "Unknown transport failure.",
  };
}

function createInvalidAvailabilityOperationError(
  requestOperation: string,
): HotelbedsIntegrationError {
  return createHotelbedsIntegrationError({
    code: HotelbedsIntegrationErrorCode.VALIDATION_ERROR,
    retryable: false,
    message: `Invalid Hotelbeds availability operation: ${requestOperation}.`,
  });
}

export class DefaultHotelbedsAvailabilityExecutor implements HotelbedsAvailabilityExecutor {
  private readonly options: HotelbedsAvailabilityExecutorOptions;

  public constructor(
    private readonly configLoader: () => HotelbedsIntegrationConfig = () =>
      loadHotelbedsIntegrationConfig(),
    private readonly authentication: HotelbedsAuthentication = new DefaultHotelbedsAuthentication(),
    private readonly transport: HotelbedsTransport = new FetchHotelbedsTransport(),
    options?: Partial<HotelbedsAvailabilityExecutorOptions>,
  ) {
    this.options = {
      ...DEFAULT_EXECUTOR_OPTIONS,
      ...(options ?? {}),
    };
  }

  public async execute(
    requests: ReadonlyArray<HotelbedsAvailabilityRequest>,
  ): Promise<HotelbedsAvailabilityExecutionResult> {
    const responses: HotelbedsAvailabilityRawResponse[] = [];

    for (let requestIndex = 0; requestIndex < requests.length; requestIndex += 1) {
      const request = requests[requestIndex];
      if (!request) {
        continue;
      }

      if (request.operation !== "availability") {
        responses.push({
          requestIndex,
          request,
          success: false,
          retryable: false,
          attempts: 1,
          errors: [createInvalidAvailabilityOperationError(request.operation)],
        });
        continue;
      }

      const result = await this.executeRequestWithRetry(requestIndex, request);
      responses.push(result);
    }

    return createHotelbedsAvailabilityExecutionResult({
      provider: "hotelbeds",
      operation: "availability",
      completedAt: new Date(),
      responses: Object.freeze(responses),
    });
  }

  private async executeRequestWithRetry(
    requestIndex: number,
    request: HotelbedsAvailabilityRequest,
  ): Promise<HotelbedsAvailabilityRawResponse> {
    let attempts = 0;

    while (attempts < this.options.maxAttempts) {
      attempts += 1;

      try {
        const config = this.configLoader();
        const preparedHeaders = this.authentication.prepareHeaders(request, {
          correlationId: request.correlationId,
          requestId: request.requestId,
        });

        const response = await this.transport.execute(config, {
          method: request.method,
          path: request.path,
          query: request.query,
          body: request.body,
          headers: {
            ...preparedHeaders,
            "Accept-Encoding": "gzip",
          },
        });

        if (response.status >= 200 && response.status < 300) {
          return {
            requestIndex,
            request,
            success: true,
            retryable: false,
            attempts,
            httpStatus: response.status,
            headers: response.headers,
            body: response.body,
            errors: [],
          };
        }

        const mappedError = mapHotelbedsHttpError(response.status, response.body);
        const failureResponse: HotelbedsAvailabilityRawResponse = {
          requestIndex,
          request,
          success: false,
          retryable: mappedError.retryable,
          attempts,
          httpStatus: response.status,
          headers: response.headers,
          body: response.body,
          supplierError: readSupplierError(response.body),
          errors: [mappedError],
        };

        if (!mappedError.retryable || attempts >= this.options.maxAttempts) {
          return failureResponse;
        }
      } catch (error) {
        const mappedError = mapHotelbedsTransportError(error);
        const failureResponse: HotelbedsAvailabilityRawResponse = {
          requestIndex,
          request,
          success: false,
          retryable: mappedError.retryable,
          attempts,
          transportFailure: createTransportFailure(error),
          errors: [mappedError],
        };

        if (!mappedError.retryable || attempts >= this.options.maxAttempts) {
          return failureResponse;
        }
      }
    }

    return {
      requestIndex,
      request,
      success: false,
      retryable: false,
      attempts,
      errors: [
        createHotelbedsIntegrationError({
          code: HotelbedsIntegrationErrorCode.UNKNOWN_ERROR,
          retryable: false,
          message: "Availability execution exhausted retries without a terminal response.",
        }),
      ],
    };
  }
}

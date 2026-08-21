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

export interface HotelbedsSupplierProtectionSettings {
  readonly maxQps: number;
  readonly maxConcurrency: number;
  readonly now: () => number;
  readonly sleep: (delayMs: number) => Promise<void>;
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
  readonly maxQps: number;
  readonly maxConcurrency: number;
  readonly now: () => number;
  readonly sleep: (delayMs: number) => Promise<void>;
}

const DEFAULT_EXECUTOR_OPTIONS: HotelbedsAvailabilityExecutorOptions = Object.freeze({
  maxAttempts: 3,
  maxQps: 20,
  maxConcurrency: 20,
  now: () => Date.now(),
  sleep: async (delayMs: number) => {
    await new Promise<void>((resolve) => setTimeout(resolve, delayMs));
  },
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

class HotelbedsSupplierRateLimiter {
  private readonly minIntervalMs: number;
  private readonly now: () => number;
  private readonly sleep: (delayMs: number) => Promise<void>;
  private lastRequestAt = 0;

  public constructor(settings: HotelbedsSupplierProtectionSettings) {
    if (!Number.isInteger(settings.maxQps) || settings.maxQps <= 0) {
      throw new Error("Hotelbeds availability max QPS must be a positive integer.");
    }

    this.now = settings.now;
    this.sleep = settings.sleep;
    this.minIntervalMs = 1000 / settings.maxQps;
  }

  public async acquire(): Promise<void> {
    const elapsedSinceRequest = this.now() - this.lastRequestAt;
    if (this.lastRequestAt > 0 && elapsedSinceRequest < this.minIntervalMs) {
      const delayMs = Math.max(0, Math.ceil(this.minIntervalMs - elapsedSinceRequest));
      await this.sleep(delayMs);
    }
    this.lastRequestAt = this.now();
  }
}

class HotelbedsSupplierConcurrencyGate {
  private readonly maxConcurrency: number;
  private readonly active = new Set<symbol>();

  public constructor(settings: HotelbedsSupplierProtectionSettings) {
    if (!Number.isInteger(settings.maxConcurrency) || settings.maxConcurrency <= 0) {
      throw new Error("Hotelbeds availability max concurrency must be a positive integer.");
    }

    this.maxConcurrency = settings.maxConcurrency;
  }

  public async acquire(): Promise<() => void> {
    const ticket = Symbol("hotelbeds-supplier-ticket");
    while (this.active.size >= this.maxConcurrency) {
      await new Promise<void>((resolve) => setTimeout(resolve, 10));
    }
    this.active.add(ticket);
    return () => {
      this.active.delete(ticket);
    };
  }
}

export class DefaultHotelbedsAvailabilityExecutor implements HotelbedsAvailabilityExecutor {
  private readonly options: HotelbedsAvailabilityExecutorOptions;

  public constructor(
    private readonly configLoader: () => HotelbedsIntegrationConfig = (): HotelbedsIntegrationConfig =>
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

    if (requests.length === 0) {
      return createHotelbedsAvailabilityExecutionResult({
        provider: "hotelbeds",
        operation: "availability",
        completedAt: new Date(),
        responses: Object.freeze([]),
      });
    }

    const config = this.configLoader();
    const maxQps = this.options.maxQps ?? config.availabilityMaxQps ?? DEFAULT_EXECUTOR_OPTIONS.maxQps;
    const maxConcurrency = this.options.maxConcurrency ?? config.availabilityMaxConcurrency ?? DEFAULT_EXECUTOR_OPTIONS.maxConcurrency;

    if (!Number.isInteger(maxQps) || maxQps <= 0) {
      throw new Error("Hotelbeds availability max QPS must be a positive integer.");
    }

    if (!Number.isInteger(maxConcurrency) || maxConcurrency <= 0) {
      throw new Error("Hotelbeds availability max concurrency must be a positive integer.");
    }

    const protectionSettings = {
      maxQps,
      maxConcurrency,
      now: this.options.now,
      sleep: this.options.sleep,
    };

    const rateLimiter = new HotelbedsSupplierRateLimiter(protectionSettings);
    const concurrencyGate = new HotelbedsSupplierConcurrencyGate(protectionSettings);

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

      const result = await this.executeRequestWithRetry(requestIndex, request, rateLimiter, concurrencyGate);
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
    rateLimiter: HotelbedsSupplierRateLimiter,
    concurrencyGate: HotelbedsSupplierConcurrencyGate,
  ): Promise<HotelbedsAvailabilityRawResponse> {
    let attempts = 0;

    while (attempts < this.options.maxAttempts) {
      attempts += 1;

      try {
        await rateLimiter.acquire();
        const release = await concurrencyGate.acquire();
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
        } finally {
          release();
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

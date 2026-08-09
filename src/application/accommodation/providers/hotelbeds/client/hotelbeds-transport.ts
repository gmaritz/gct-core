import { HotelbedsIntegrationConfig } from "./hotelbeds-integration-config";

export interface HotelbedsTransportRequest {
  readonly method: "GET" | "POST";
  readonly path: string;
  readonly headers?: Readonly<Record<string, string>>;
  readonly query?: Readonly<Record<string, string | number | boolean>>;
  readonly body?: unknown;
  readonly timeoutMs?: number;
}

export interface HotelbedsTransportResponse {
  readonly status: number;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: unknown;
  readonly durationMs: number;
}

export enum HotelbedsTransportErrorKind {
  TIMEOUT = "TIMEOUT",
  NETWORK = "NETWORK",
  MALFORMED_RESPONSE = "MALFORMED_RESPONSE",
  UNKNOWN = "UNKNOWN",
}

export class HotelbedsTransportError extends Error {
  public constructor(
    public readonly kind: HotelbedsTransportErrorKind,
    message: string,
    public readonly providerCode?: string,
  ) {
    super(message);
    this.name = "HotelbedsTransportError";
  }
}

interface FetchLikeResponse {
  readonly status: number;
  readonly headers: {
    forEach(callback: (value: string, key: string) => void): void;
  };
  text(): Promise<string>;
}

export type HotelbedsFetchLike = (
  input: string,
  init: {
    method: string;
    headers: Record<string, string>;
    body?: string;
    signal: AbortSignal;
  },
) => Promise<FetchLikeResponse>;

export interface HotelbedsTransport {
  execute(
    config: HotelbedsIntegrationConfig,
    request: HotelbedsTransportRequest,
  ): Promise<HotelbedsTransportResponse>;
}

function resolveFetch(fetchOverride?: HotelbedsFetchLike): HotelbedsFetchLike {
  if (fetchOverride) {
    return fetchOverride;
  }

  if (typeof globalThis.fetch !== "function") {
    throw new HotelbedsTransportError(
      HotelbedsTransportErrorKind.UNKNOWN,
      "No fetch implementation is available for Hotelbeds transport.",
    );
  }

  return globalThis.fetch as unknown as HotelbedsFetchLike;
}

function mapHeaders(headers: FetchLikeResponse["headers"]): Readonly<Record<string, string>> {
  const mapped: Record<string, string> = {};
  headers.forEach((value, key) => {
    mapped[key] = value;
  });

  return Object.freeze(mapped);
}

function buildUrl(baseUrl: string, request: HotelbedsTransportRequest): string {
  const url = new URL(request.path, baseUrl);
  Object.entries(request.query ?? {}).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  return url.toString();
}

function parseResponseBody(rawBody: string): unknown {
  if (rawBody.trim().length === 0) {
    return undefined;
  }

  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    throw new HotelbedsTransportError(
      HotelbedsTransportErrorKind.MALFORMED_RESPONSE,
      "Hotelbeds returned malformed JSON.",
    );
  }
}

export class FetchHotelbedsTransport implements HotelbedsTransport {
  private readonly fetchClient: HotelbedsFetchLike;

  public constructor(fetchClient?: HotelbedsFetchLike) {
    this.fetchClient = resolveFetch(fetchClient);
  }

  public async execute(
    config: HotelbedsIntegrationConfig,
    request: HotelbedsTransportRequest,
  ): Promise<HotelbedsTransportResponse> {
    const timeoutMs = request.timeoutMs ?? config.timeoutMs;
    const controller = new AbortController();
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    const startedAt = Date.now();

    try {
      const response = await this.fetchClient(buildUrl(config.baseUrl, request), {
        method: request.method,
        headers: { ...(request.headers ?? {}) },
        body: request.body === undefined ? undefined : JSON.stringify(request.body),
        signal: controller.signal,
      });
      const rawBody = await response.text();
      const body = parseResponseBody(rawBody);

      return {
        status: response.status,
        headers: mapHeaders(response.headers),
        body,
        durationMs: Date.now() - startedAt,
      };
    } catch (error) {
      if (timedOut) {
        throw new HotelbedsTransportError(
          HotelbedsTransportErrorKind.TIMEOUT,
          "Hotelbeds request timed out.",
        );
      }

      if (error instanceof HotelbedsTransportError) {
        throw error;
      }

      const providerCode =
        error instanceof Error && "code" in error && typeof error.code === "string"
          ? error.code
          : undefined;
      const message = error instanceof Error ? error.message : "Unknown transport error.";

      throw new HotelbedsTransportError(HotelbedsTransportErrorKind.NETWORK, message, providerCode);
    } finally {
      clearTimeout(timeout);
    }
  }
}
import { gunzipSync } from "zlib";

import { HotelbedsIntegrationConfig } from "./hotelbeds-integration-config";

export interface HotelbedsTransportTlsConfig {
  readonly clientCertificate: string;
  readonly privateKey: string;
  readonly trustedCa: string;
}

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
  TLS_CONFIGURATION = "TLS_CONFIGURATION",
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
    get?(key: string): string | null;
  };
  text(): Promise<string>;
  arrayBuffer?(): Promise<ArrayBuffer>;
}

interface HotelbedsFetchInit {
  method: string;
  headers: Record<string, string>;
  body?: string;
  signal: AbortSignal;
  tls?: HotelbedsTransportTlsConfig;
}

export type HotelbedsFetchLike = (
  input: string,
  init: HotelbedsFetchInit,
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
    mapped[key.toLowerCase()] = value;
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

function isGzip(headers: Readonly<Record<string, string>>): boolean {
  const encoding = headers["content-encoding"];
  return typeof encoding === "string" && encoding.toLowerCase().includes("gzip");
}

async function decodeResponseBody(
  response: FetchLikeResponse,
  headers: Readonly<Record<string, string>>,
): Promise<string> {
  if (!isGzip(headers) || !response.arrayBuffer) {
    return response.text();
  }

  try {
    const buffer = await response.arrayBuffer();
    return gunzipSync(Buffer.from(buffer)).toString("utf8");
  } catch {
    throw new HotelbedsTransportError(
      HotelbedsTransportErrorKind.MALFORMED_RESPONSE,
      "Hotelbeds returned an invalid gzip payload.",
    );
  }
}

function resolveTlsConfig(config: HotelbedsIntegrationConfig): HotelbedsTransportTlsConfig | undefined {
  if (!config.tls) {
    return undefined;
  }

  const { clientCertificate, privateKey, trustedCa } = config.tls;
  if (!clientCertificate || !privateKey || !trustedCa) {
    throw new HotelbedsTransportError(
      HotelbedsTransportErrorKind.TLS_CONFIGURATION,
      "Hotelbeds TLS configuration is incomplete.",
    );
  }

  return {
    clientCertificate,
    privateKey,
    trustedCa,
  };
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
        tls: resolveTlsConfig(config),
      });

      const headers = mapHeaders(response.headers);
      const rawBody = await decodeResponseBody(response, headers);
      const body = parseResponseBody(rawBody);

      return {
        status: response.status,
        headers,
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

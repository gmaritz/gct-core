import { IncomingHttpHeaders } from "http";
import { request as httpsRequest, RequestOptions } from "https";
import { gunzipSync } from "zlib";

import { HotelbedsIntegrationConfig } from "./hotelbeds-integration-config";

export interface HotelbedsTransportTlsConfig {
  readonly clientCertificate: string;
  readonly privateKey: string;
  readonly privateKeyPassphrase?: string;
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

export interface HotelbedsHttpsResponse {
  readonly statusCode?: number;
  readonly headers: IncomingHttpHeaders;
  on(event: "data", listener: (chunk: Buffer) => void): this;
  on(event: "end", listener: () => void): this;
  on(event: "error", listener: (error: Error) => void): this;
}

export interface HotelbedsHttpsRequest {
  on(event: "error", listener: (error: Error) => void): this;
  setTimeout(timeoutMs: number, callback: () => void): this;
  write(body: string): boolean;
  end(): void;
  destroy(error?: Error): void;
}

export type HotelbedsHttpsRequestLike = (
  options: RequestOptions,
  callback: (response: HotelbedsHttpsResponse) => void,
) => HotelbedsHttpsRequest;

export interface HotelbedsTransport {
  execute(
    config: HotelbedsIntegrationConfig,
    request: HotelbedsTransportRequest,
  ): Promise<HotelbedsTransportResponse>;
}

function mapHeaders(headers: IncomingHttpHeaders): Readonly<Record<string, string>> {
  const mapped: Record<string, string> = {};
  Object.entries(headers).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      mapped[key.toLowerCase()] = value.join(", ");
    } else if (value !== undefined) {
      mapped[key.toLowerCase()] = String(value);
    }
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

function decodeResponseBody(rawBody: Buffer, headers: Readonly<Record<string, string>>): string {
  try {
    if (isGzip(headers)) {
      return gunzipSync(rawBody).toString("utf8");
    }

    return rawBody.toString("utf8");
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
  if (!clientCertificate || !privateKey) {
    throw new HotelbedsTransportError(
      HotelbedsTransportErrorKind.TLS_CONFIGURATION,
      "Hotelbeds TLS certificate and private key are required together.",
    );
  }

  return {
    clientCertificate,
    privateKey,
    privateKeyPassphrase: config.tls.privateKeyPassphrase,
    trustedCa,
  };
}

export class FetchHotelbedsTransport implements HotelbedsTransport {
  private readonly requestClient: HotelbedsHttpsRequestLike;

  public constructor(requestClient: HotelbedsHttpsRequestLike = httpsRequest) {
    this.requestClient = requestClient;
  }

  public async execute(
    config: HotelbedsIntegrationConfig,
    request: HotelbedsTransportRequest,
  ): Promise<HotelbedsTransportResponse> {
    const timeoutMs = request.timeoutMs ?? config.timeoutMs;
    let timedOut = false;
    const startedAt = Date.now();

    try {
      const url = new URL(buildUrl(config.baseUrl, request));
      const tls = resolveTlsConfig(config);
      const response = await new Promise<{ statusCode: number; headers: IncomingHttpHeaders; body: Buffer }>(
        (resolve, reject) => {
          let settled = false;
          const settleReject = (error: Error): void => {
            if (!settled) {
              settled = true;
              reject(error);
            }
          };
          const settleResolve = (value: { statusCode: number; headers: IncomingHttpHeaders; body: Buffer }): void => {
            if (!settled) {
              settled = true;
              resolve(value);
            }
          };

          const clientRequest = this.requestClient({
            protocol: url.protocol,
            hostname: url.hostname,
            port: url.port || undefined,
            path: `${url.pathname}${url.search}`,
            method: request.method,
            headers: { ...(request.headers ?? {}) },
            ...(tls
              ? {
                  cert: tls.clientCertificate,
                  key: tls.privateKey,
                  ...(tls.privateKeyPassphrase ? { passphrase: tls.privateKeyPassphrase } : {}),
                  ...(tls.trustedCa ? { ca: tls.trustedCa } : {}),
                }
              : {}),
          }, (incomingResponse) => {
            const chunks: Buffer[] = [];
            incomingResponse.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
            incomingResponse.on("end", () => {
              if (typeof incomingResponse.statusCode !== "number") {
                settleReject(new HotelbedsTransportError(
                  HotelbedsTransportErrorKind.MALFORMED_RESPONSE,
                  "Hotelbeds response did not include an HTTP status.",
                ));
                return;
              }
              settleResolve({
                statusCode: incomingResponse.statusCode,
                headers: incomingResponse.headers,
                body: Buffer.concat(chunks),
              });
            });
            incomingResponse.on("error", settleReject);
          });

          clientRequest.setTimeout(timeoutMs, () => {
            timedOut = true;
            settleReject(new HotelbedsTransportError(
              HotelbedsTransportErrorKind.TIMEOUT,
              "Hotelbeds request timed out.",
            ));
            clientRequest.destroy();
          });
          clientRequest.on("error", settleReject);

          if (request.body !== undefined) {
            clientRequest.write(JSON.stringify(request.body));
          }
          clientRequest.end();
        },
      );

      const headers = mapHeaders(response.headers);
      const body = parseResponseBody(decodeResponseBody(response.body, headers));

      return {
        status: response.statusCode,
        headers,
        body,
        durationMs: Date.now() - startedAt,
      };
    } catch (error) {
      if (timedOut || error instanceof HotelbedsTransportError && error.kind === HotelbedsTransportErrorKind.TIMEOUT) {
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
    }
  }
}

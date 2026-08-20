import { IncomingHttpHeaders } from "http";
import { RequestOptions } from "https";
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
export declare enum HotelbedsTransportErrorKind {
    TIMEOUT = "TIMEOUT",
    NETWORK = "NETWORK",
    MALFORMED_RESPONSE = "MALFORMED_RESPONSE",
    TLS_CONFIGURATION = "TLS_CONFIGURATION",
    UNKNOWN = "UNKNOWN"
}
export declare class HotelbedsTransportError extends Error {
    readonly kind: HotelbedsTransportErrorKind;
    readonly providerCode?: string | undefined;
    constructor(kind: HotelbedsTransportErrorKind, message: string, providerCode?: string | undefined);
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
export type HotelbedsHttpsRequestLike = (options: RequestOptions, callback: (response: HotelbedsHttpsResponse) => void) => HotelbedsHttpsRequest;
export interface HotelbedsTransport {
    execute(config: HotelbedsIntegrationConfig, request: HotelbedsTransportRequest): Promise<HotelbedsTransportResponse>;
}
export declare class FetchHotelbedsTransport implements HotelbedsTransport {
    private readonly requestClient;
    constructor(requestClient?: HotelbedsHttpsRequestLike);
    execute(config: HotelbedsIntegrationConfig, request: HotelbedsTransportRequest): Promise<HotelbedsTransportResponse>;
}
//# sourceMappingURL=hotelbeds-transport.d.ts.map
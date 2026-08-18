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
export type HotelbedsFetchLike = (input: string, init: HotelbedsFetchInit) => Promise<FetchLikeResponse>;
export interface HotelbedsTransport {
    execute(config: HotelbedsIntegrationConfig, request: HotelbedsTransportRequest): Promise<HotelbedsTransportResponse>;
}
export declare class FetchHotelbedsTransport implements HotelbedsTransport {
    private readonly fetchClient;
    constructor(fetchClient?: HotelbedsFetchLike);
    execute(config: HotelbedsIntegrationConfig, request: HotelbedsTransportRequest): Promise<HotelbedsTransportResponse>;
}
export {};
//# sourceMappingURL=hotelbeds-transport.d.ts.map
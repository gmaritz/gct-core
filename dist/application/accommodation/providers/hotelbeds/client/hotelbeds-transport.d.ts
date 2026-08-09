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
export declare enum HotelbedsTransportErrorKind {
    TIMEOUT = "TIMEOUT",
    NETWORK = "NETWORK",
    MALFORMED_RESPONSE = "MALFORMED_RESPONSE",
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
    };
    text(): Promise<string>;
}
export type HotelbedsFetchLike = (input: string, init: {
    method: string;
    headers: Record<string, string>;
    body?: string;
    signal: AbortSignal;
}) => Promise<FetchLikeResponse>;
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
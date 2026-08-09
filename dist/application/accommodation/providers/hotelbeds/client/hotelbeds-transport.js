"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchHotelbedsTransport = exports.HotelbedsTransportError = exports.HotelbedsTransportErrorKind = void 0;
var HotelbedsTransportErrorKind;
(function (HotelbedsTransportErrorKind) {
    HotelbedsTransportErrorKind["TIMEOUT"] = "TIMEOUT";
    HotelbedsTransportErrorKind["NETWORK"] = "NETWORK";
    HotelbedsTransportErrorKind["MALFORMED_RESPONSE"] = "MALFORMED_RESPONSE";
    HotelbedsTransportErrorKind["UNKNOWN"] = "UNKNOWN";
})(HotelbedsTransportErrorKind || (exports.HotelbedsTransportErrorKind = HotelbedsTransportErrorKind = {}));
class HotelbedsTransportError extends Error {
    constructor(kind, message, providerCode) {
        super(message);
        this.kind = kind;
        this.providerCode = providerCode;
        this.name = "HotelbedsTransportError";
    }
}
exports.HotelbedsTransportError = HotelbedsTransportError;
function resolveFetch(fetchOverride) {
    if (fetchOverride) {
        return fetchOverride;
    }
    if (typeof globalThis.fetch !== "function") {
        throw new HotelbedsTransportError(HotelbedsTransportErrorKind.UNKNOWN, "No fetch implementation is available for Hotelbeds transport.");
    }
    return globalThis.fetch;
}
function mapHeaders(headers) {
    const mapped = {};
    headers.forEach((value, key) => {
        mapped[key] = value;
    });
    return Object.freeze(mapped);
}
function buildUrl(baseUrl, request) {
    const url = new URL(request.path, baseUrl);
    Object.entries(request.query ?? {}).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
    });
    return url.toString();
}
function parseResponseBody(rawBody) {
    if (rawBody.trim().length === 0) {
        return undefined;
    }
    try {
        return JSON.parse(rawBody);
    }
    catch {
        throw new HotelbedsTransportError(HotelbedsTransportErrorKind.MALFORMED_RESPONSE, "Hotelbeds returned malformed JSON.");
    }
}
class FetchHotelbedsTransport {
    constructor(fetchClient) {
        this.fetchClient = resolveFetch(fetchClient);
    }
    async execute(config, request) {
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
        }
        catch (error) {
            if (timedOut) {
                throw new HotelbedsTransportError(HotelbedsTransportErrorKind.TIMEOUT, "Hotelbeds request timed out.");
            }
            if (error instanceof HotelbedsTransportError) {
                throw error;
            }
            const providerCode = error instanceof Error && "code" in error && typeof error.code === "string"
                ? error.code
                : undefined;
            const message = error instanceof Error ? error.message : "Unknown transport error.";
            throw new HotelbedsTransportError(HotelbedsTransportErrorKind.NETWORK, message, providerCode);
        }
        finally {
            clearTimeout(timeout);
        }
    }
}
exports.FetchHotelbedsTransport = FetchHotelbedsTransport;
//# sourceMappingURL=hotelbeds-transport.js.map
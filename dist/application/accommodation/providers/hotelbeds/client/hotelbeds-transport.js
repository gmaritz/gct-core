"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FetchHotelbedsTransport = exports.HotelbedsTransportError = exports.HotelbedsTransportErrorKind = void 0;
const https_1 = require("https");
const zlib_1 = require("zlib");
var HotelbedsTransportErrorKind;
(function (HotelbedsTransportErrorKind) {
    HotelbedsTransportErrorKind["TIMEOUT"] = "TIMEOUT";
    HotelbedsTransportErrorKind["NETWORK"] = "NETWORK";
    HotelbedsTransportErrorKind["MALFORMED_RESPONSE"] = "MALFORMED_RESPONSE";
    HotelbedsTransportErrorKind["TLS_CONFIGURATION"] = "TLS_CONFIGURATION";
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
function mapHeaders(headers) {
    const mapped = {};
    Object.entries(headers).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            mapped[key.toLowerCase()] = value.join(", ");
        }
        else if (value !== undefined) {
            mapped[key.toLowerCase()] = String(value);
        }
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
function isGzip(headers) {
    const encoding = headers["content-encoding"];
    return typeof encoding === "string" && encoding.toLowerCase().includes("gzip");
}
function decodeResponseBody(rawBody, headers) {
    try {
        if (isGzip(headers)) {
            return (0, zlib_1.gunzipSync)(rawBody).toString("utf8");
        }
        return rawBody.toString("utf8");
    }
    catch {
        throw new HotelbedsTransportError(HotelbedsTransportErrorKind.MALFORMED_RESPONSE, "Hotelbeds returned an invalid gzip payload.");
    }
}
function resolveTlsConfig(config) {
    if (!config.tls) {
        return undefined;
    }
    const { clientCertificate, privateKey, trustedCa } = config.tls;
    if (!clientCertificate || !privateKey) {
        throw new HotelbedsTransportError(HotelbedsTransportErrorKind.TLS_CONFIGURATION, "Hotelbeds TLS certificate and private key are required together.");
    }
    return {
        clientCertificate,
        privateKey,
        privateKeyPassphrase: config.tls.privateKeyPassphrase,
        trustedCa,
    };
}
class FetchHotelbedsTransport {
    constructor(requestClient = https_1.request) {
        this.requestClient = requestClient;
    }
    async execute(config, request) {
        const timeoutMs = request.timeoutMs ?? config.timeoutMs;
        let timedOut = false;
        const startedAt = Date.now();
        try {
            const url = new URL(buildUrl(config.baseUrl, request));
            const tls = resolveTlsConfig(config);
            const response = await new Promise((resolve, reject) => {
                let settled = false;
                const settleReject = (error) => {
                    if (!settled) {
                        settled = true;
                        reject(error);
                    }
                };
                const settleResolve = (value) => {
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
                    const chunks = [];
                    incomingResponse.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
                    incomingResponse.on("end", () => {
                        if (typeof incomingResponse.statusCode !== "number") {
                            settleReject(new HotelbedsTransportError(HotelbedsTransportErrorKind.MALFORMED_RESPONSE, "Hotelbeds response did not include an HTTP status."));
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
                    settleReject(new HotelbedsTransportError(HotelbedsTransportErrorKind.TIMEOUT, "Hotelbeds request timed out."));
                    clientRequest.destroy();
                });
                clientRequest.on("error", settleReject);
                if (request.body !== undefined) {
                    clientRequest.write(JSON.stringify(request.body));
                }
                clientRequest.end();
            });
            const headers = mapHeaders(response.headers);
            const body = parseResponseBody(decodeResponseBody(response.body, headers));
            return {
                status: response.statusCode,
                headers,
                body,
                durationMs: Date.now() - startedAt,
            };
        }
        catch (error) {
            if (timedOut || error instanceof HotelbedsTransportError && error.kind === HotelbedsTransportErrorKind.TIMEOUT) {
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
    }
}
exports.FetchHotelbedsTransport = FetchHotelbedsTransport;
//# sourceMappingURL=hotelbeds-transport.js.map
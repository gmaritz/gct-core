"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_AVAILABILITY_MAX_CONCURRENCY = exports.DEFAULT_AVAILABILITY_MAX_QPS = exports.DEFAULT_CONTENT_RETRY_BASE_DELAY_MS = exports.DEFAULT_CONTENT_MAX_RETRIES = exports.DEFAULT_CONTENT_MAX_QPS = exports.DEFAULT_CONTENT_BATCH_SIZE = exports.HotelbedsConfigurationError = exports.HotelbedsEnvironment = void 0;
exports.createHotelbedsIntegrationConfig = createHotelbedsIntegrationConfig;
exports.loadHotelbedsIntegrationConfig = loadHotelbedsIntegrationConfig;
var HotelbedsEnvironment;
(function (HotelbedsEnvironment) {
    HotelbedsEnvironment["TEST"] = "TEST";
    HotelbedsEnvironment["PRODUCTION"] = "PRODUCTION";
})(HotelbedsEnvironment || (exports.HotelbedsEnvironment = HotelbedsEnvironment = {}));
class HotelbedsConfigurationError extends Error {
    constructor(message) {
        super(message);
        this.code = "CONFIGURATION_ERROR";
        this.name = "HotelbedsConfigurationError";
    }
}
exports.HotelbedsConfigurationError = HotelbedsConfigurationError;
const DEFAULT_TIMEOUT_MS = 10000;
exports.DEFAULT_CONTENT_BATCH_SIZE = 50;
exports.DEFAULT_CONTENT_MAX_QPS = 1;
exports.DEFAULT_CONTENT_MAX_RETRIES = 3;
exports.DEFAULT_CONTENT_RETRY_BASE_DELAY_MS = 1000;
exports.DEFAULT_AVAILABILITY_MAX_QPS = 20;
exports.DEFAULT_AVAILABILITY_MAX_CONCURRENCY = 20;
const DEFAULT_BASE_URLS = {
    [HotelbedsEnvironment.TEST]: "https://api.test.hotelbeds.com",
    [HotelbedsEnvironment.PRODUCTION]: "https://api.hotelbeds.com",
};
function isBlank(value) {
    return typeof value !== "string" || value.trim().length === 0;
}
function parseEnvironment(rawEnvironment, nodeEnvironment) {
    const candidate = rawEnvironment?.trim().toUpperCase();
    if (candidate === HotelbedsEnvironment.TEST || candidate === HotelbedsEnvironment.PRODUCTION) {
        return candidate;
    }
    if (nodeEnvironment?.trim().toLowerCase() === "production") {
        return HotelbedsEnvironment.PRODUCTION;
    }
    return HotelbedsEnvironment.TEST;
}
function parseTimeout(rawTimeout) {
    if (!rawTimeout || rawTimeout.trim().length === 0) {
        return DEFAULT_TIMEOUT_MS;
    }
    const parsed = Number.parseInt(rawTimeout, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
        throw new HotelbedsConfigurationError("HOTELBEDS_TIMEOUT_MS must be a positive integer.");
    }
    return parsed;
}
function parsePositiveInteger(rawValue, fallback, variableName) {
    if (!rawValue || rawValue.trim().length === 0)
        return fallback;
    const parsed = Number.parseInt(rawValue, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new HotelbedsConfigurationError(`${variableName} must be a positive integer.`);
    }
    return parsed;
}
function parseNonNegativeInteger(rawValue, fallback, variableName) {
    if (!rawValue || rawValue.trim().length === 0)
        return fallback;
    const parsed = Number.parseInt(rawValue, 10);
    if (!Number.isInteger(parsed) || parsed < 0) {
        throw new HotelbedsConfigurationError(`${variableName} must be a non-negative integer.`);
    }
    return parsed;
}
function validateUrl(value) {
    try {
        const parsed = new URL(value);
        if (!parsed.protocol || !parsed.hostname) {
            throw new Error("Invalid URL");
        }
        return parsed.toString().replace(/\/$/, "");
    }
    catch {
        throw new HotelbedsConfigurationError("HOTELBEDS_BASE_URL must be a valid absolute URL.");
    }
}
function parseSelectedHotelCodes(rawCodes) {
    if (!rawCodes || rawCodes.trim().length === 0) {
        return [];
    }
    return Object.freeze([...new Set(rawCodes.split(",").map((code) => code.trim()).filter((code) => code.length > 0))]);
}
function parseTlsConfig(env) {
    const clientCertificate = env.HOTELBEDS_TLS_CLIENT_CERTIFICATE?.trim();
    const privateKey = env.HOTELBEDS_TLS_PRIVATE_KEY?.trim();
    const trustedCa = env.HOTELBEDS_TLS_TRUSTED_CA?.trim();
    const definedValues = [clientCertificate, privateKey, trustedCa].filter((value) => typeof value === "string" && value.length > 0).length;
    if (definedValues === 0) {
        return undefined;
    }
    if (definedValues !== 3) {
        throw new HotelbedsConfigurationError("HOTELBEDS_TLS_CLIENT_CERTIFICATE, HOTELBEDS_TLS_PRIVATE_KEY, and HOTELBEDS_TLS_TRUSTED_CA must be provided together.");
    }
    return Object.freeze({
        clientCertificate: clientCertificate ?? "",
        privateKey: privateKey ?? "",
        trustedCa: trustedCa ?? "",
    });
}
function createHotelbedsIntegrationConfig(input) {
    if (isBlank(input.apiKey)) {
        throw new HotelbedsConfigurationError("Hotelbeds API key is required.");
    }
    if (isBlank(input.secret)) {
        throw new HotelbedsConfigurationError("Hotelbeds API secret is required.");
    }
    if (!input.timeoutMs || input.timeoutMs <= 0) {
        throw new HotelbedsConfigurationError("Hotelbeds timeout must be greater than zero.");
    }
    const availabilityMaxQps = input.availabilityMaxQps ?? exports.DEFAULT_AVAILABILITY_MAX_QPS;
    const availabilityMaxConcurrency = input.availabilityMaxConcurrency ?? exports.DEFAULT_AVAILABILITY_MAX_CONCURRENCY;
    if (!Number.isInteger(availabilityMaxQps) || availabilityMaxQps <= 0) {
        throw new HotelbedsConfigurationError("Hotelbeds availability max QPS must be a positive integer.");
    }
    if (!Number.isInteger(availabilityMaxConcurrency) || availabilityMaxConcurrency <= 0) {
        throw new HotelbedsConfigurationError("Hotelbeds availability max concurrency must be a positive integer.");
    }
    return Object.freeze({
        environment: input.environment,
        apiKey: input.apiKey.trim(),
        secret: input.secret.trim(),
        baseUrl: validateUrl(input.baseUrl),
        timeoutMs: input.timeoutMs,
        tls: input.tls
            ? Object.freeze({
                clientCertificate: input.tls.clientCertificate,
                privateKey: input.tls.privateKey,
                trustedCa: input.tls.trustedCa,
            })
            : undefined,
        selectedHotelCodes: Object.freeze([...(input.selectedHotelCodes ?? [])]),
        contentBatchSize: input.contentBatchSize ?? exports.DEFAULT_CONTENT_BATCH_SIZE,
        contentMaxQps: input.contentMaxQps ?? exports.DEFAULT_CONTENT_MAX_QPS,
        contentMaxRetries: input.contentMaxRetries ?? exports.DEFAULT_CONTENT_MAX_RETRIES,
        contentRetryBaseDelayMs: input.contentRetryBaseDelayMs ?? exports.DEFAULT_CONTENT_RETRY_BASE_DELAY_MS,
        availabilityMaxQps,
        availabilityMaxConcurrency,
    });
}
function loadHotelbedsIntegrationConfig(env = process.env) {
    const environment = parseEnvironment(env.HOTELBEDS_ENV, env.NODE_ENV);
    const baseUrl = env.HOTELBEDS_BASE_URL ?? DEFAULT_BASE_URLS[environment];
    return createHotelbedsIntegrationConfig({
        environment,
        apiKey: env.HOTELBEDS_API_KEY ?? "",
        secret: env.HOTELBEDS_SECRET ?? "",
        baseUrl,
        timeoutMs: parseTimeout(env.HOTELBEDS_TIMEOUT_MS),
        tls: parseTlsConfig(env),
        selectedHotelCodes: parseSelectedHotelCodes(env.HOTELBEDS_SELECTED_HOTEL_CODES),
        contentBatchSize: parsePositiveInteger(env.HOTELBEDS_CONTENT_BATCH_SIZE, exports.DEFAULT_CONTENT_BATCH_SIZE, "HOTELBEDS_CONTENT_BATCH_SIZE"),
        contentMaxQps: parsePositiveInteger(env.HOTELBEDS_CONTENT_MAX_QPS, exports.DEFAULT_CONTENT_MAX_QPS, "HOTELBEDS_CONTENT_MAX_QPS"),
        contentMaxRetries: parseNonNegativeInteger(env.HOTELBEDS_CONTENT_MAX_RETRIES, exports.DEFAULT_CONTENT_MAX_RETRIES, "HOTELBEDS_CONTENT_MAX_RETRIES"),
        contentRetryBaseDelayMs: parsePositiveInteger(env.HOTELBEDS_CONTENT_RETRY_BASE_DELAY_MS, exports.DEFAULT_CONTENT_RETRY_BASE_DELAY_MS, "HOTELBEDS_CONTENT_RETRY_BASE_DELAY_MS"),
        availabilityMaxQps: parsePositiveInteger(env.HOTELBEDS_AVAILABILITY_MAX_QPS, exports.DEFAULT_AVAILABILITY_MAX_QPS, "HOTELBEDS_AVAILABILITY_MAX_QPS"),
        availabilityMaxConcurrency: parsePositiveInteger(env.HOTELBEDS_AVAILABILITY_MAX_CONCURRENCY, exports.DEFAULT_AVAILABILITY_MAX_CONCURRENCY, "HOTELBEDS_AVAILABILITY_MAX_CONCURRENCY"),
    });
}
//# sourceMappingURL=hotelbeds-integration-config.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelbedsConfigurationError = exports.HotelbedsEnvironment = void 0;
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
    return Object.freeze({
        environment: input.environment,
        apiKey: input.apiKey.trim(),
        secret: input.secret.trim(),
        baseUrl: validateUrl(input.baseUrl),
        timeoutMs: input.timeoutMs,
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
    });
}
//# sourceMappingURL=hotelbeds-integration-config.js.map
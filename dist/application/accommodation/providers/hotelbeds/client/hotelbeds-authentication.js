"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultHotelbedsAuthentication = exports.SystemHotelbedsClock = void 0;
exports.createHotelbedsSignature = createHotelbedsSignature;
const crypto_1 = require("crypto");
const hotelbeds_integration_config_1 = require("./hotelbeds-integration-config");
class SystemHotelbedsClock {
    now() {
        return new Date();
    }
}
exports.SystemHotelbedsClock = SystemHotelbedsClock;
function createSignature(apiKey, secret, timestamp) {
    return (0, crypto_1.createHash)("sha256").update(`${apiKey}${secret}${timestamp}`).digest("hex");
}
class DefaultHotelbedsAuthentication {
    constructor(configLoader = () => (0, hotelbeds_integration_config_1.loadHotelbedsIntegrationConfig)(), clock = new SystemHotelbedsClock()) {
        this.configLoader = configLoader;
        this.clock = clock;
    }
    prepareHeaders(request, context) {
        const config = this.configLoader();
        const timestamp = Math.floor(this.clock.now().getTime() / 1000).toString();
        const signature = createSignature(config.apiKey, config.secret, timestamp);
        const headers = {
            Accept: "application/json",
            "Content-Type": "application/json",
            "Api-key": config.apiKey,
            "X-Signature": signature,
            "X-Timestamp": timestamp,
            "X-GCT-Operation": request.operation,
        };
        if (context?.correlationId) {
            headers["X-Correlation-Id"] = context.correlationId;
        }
        if (context?.requestId) {
            headers["X-Request-Id"] = context.requestId;
        }
        return Object.freeze(headers);
    }
}
exports.DefaultHotelbedsAuthentication = DefaultHotelbedsAuthentication;
function createHotelbedsSignature(apiKey, secret, timestamp) {
    return createSignature(apiKey, secret, timestamp);
}
//# sourceMappingURL=hotelbeds-authentication.js.map
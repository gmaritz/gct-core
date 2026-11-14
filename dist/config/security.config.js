"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSecurityConfig = createSecurityConfig;
function createSecurityConfig(corsEnabled, environment, anonymousSessionLifetimeSeconds, trustedProxy = true, developmentIngress = false) {
    return {
        corsEnabled,
        trustedProxy,
        anonymousSessionLifetimeSeconds,
        anonymousSessionCookieSecure: environment === "production" || developmentIngress,
    };
}
//# sourceMappingURL=security.config.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSecurityConfig = createSecurityConfig;
function createSecurityConfig(corsEnabled, environment, anonymousSessionLifetimeSeconds) {
    return {
        corsEnabled,
        trustedProxy: false,
        anonymousSessionLifetimeSeconds,
        anonymousSessionCookieSecure: environment === "production",
    };
}
//# sourceMappingURL=security.config.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSecurityConfig = createSecurityConfig;
function createSecurityConfig(corsEnabled) {
    return {
        corsEnabled,
        trustedProxy: false,
    };
}
//# sourceMappingURL=security.config.js.map
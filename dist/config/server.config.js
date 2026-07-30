"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServerConfig = createServerConfig;
function createServerConfig(port, corsEnabled) {
    return {
        port,
        host: "0.0.0.0",
        corsEnabled,
        requestIdHeader: "x-request-id",
    };
}
//# sourceMappingURL=server.config.js.map
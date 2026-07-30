"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfiguration = loadConfiguration;
const configuration_service_1 = require("../config/configuration.service");
function loadConfiguration() {
    const configuration = (0, configuration_service_1.loadConfiguration)();
    return {
        nodeEnv: configuration.platform.environment,
        port: configuration.server.port,
        databaseUrl: configuration.database.url,
    };
}
//# sourceMappingURL=configuration.js.map
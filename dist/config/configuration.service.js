"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationService = void 0;
exports.loadConfiguration = loadConfiguration;
const database_config_1 = require("./database.config");
const logging_config_1 = require("./logging.config");
const platform_config_1 = require("./platform.config");
const security_config_1 = require("./security.config");
const server_config_1 = require("./server.config");
class ConfigurationService {
    constructor() {
        this.configuration = this.createConfiguration();
    }
    getConfiguration() {
        return this.configuration;
    }
    createConfiguration() {
        const nodeEnv = process.env.NODE_ENV ?? "development";
        const port = this.parsePort(process.env.PORT ?? "3000");
        const databaseUrl = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/gct_core";
        const loggingLevel = process.env.LOG_LEVEL ?? "info";
        const corsEnabled = this.parseBoolean(process.env.CORS_ENABLED ?? "true");
        const anonymousSessionLifetimeSeconds = this.parseBoundedInteger(process.env.ANONYMOUS_SESSION_TTL_SECONDS ?? "43200", "ANONYMOUS_SESSION_TTL_SECONDS", 300, 604800);
        return {
            platform: (0, platform_config_1.createPlatformConfig)("0.1.0", "local", nodeEnv),
            database: (0, database_config_1.createDatabaseConfig)(databaseUrl),
            logging: (0, logging_config_1.createLoggingConfig)(loggingLevel),
            security: (0, security_config_1.createSecurityConfig)(corsEnabled, nodeEnv, anonymousSessionLifetimeSeconds),
            server: (0, server_config_1.createServerConfig)(port, corsEnabled),
        };
    }
    parsePort(value) {
        const parsed = Number.parseInt(value, 10);
        if (Number.isNaN(parsed) || parsed < 1 || parsed > 65535) {
            return 3000;
        }
        return parsed;
    }
    parseBoolean(value) {
        return value === "true";
    }
    parseBoundedInteger(value, name, minimum, maximum) {
        const parsed = Number(value);
        if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
            throw new Error(`${name} must be an integer between ${minimum} and ${maximum}.`);
        }
        return parsed;
    }
}
exports.ConfigurationService = ConfigurationService;
function loadConfiguration() {
    return new ConfigurationService().getConfiguration();
}
//# sourceMappingURL=configuration.service.js.map
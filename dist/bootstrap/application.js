"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrapApplication = bootstrapApplication;
const configuration_1 = require("./configuration");
const logging_1 = require("./logging");
const lifecycle_1 = require("./lifecycle");
const prisma_1 = require("./prisma");
function formatEnvironmentLabel(environment) {
    return `${environment.charAt(0).toUpperCase()}${environment.slice(1)}`;
}
async function bootstrapApplication() {
    const configuration = (0, configuration_1.loadConfiguration)();
    const logger = (0, logging_1.initialiseLogging)();
    logger.info("==================================================");
    logger.info("Go Cape Tours Core Platform");
    logger.info(`Environment : ${formatEnvironmentLabel(configuration.nodeEnv)}`);
    logger.info("[OK] Configuration Loaded");
    logger.info("[OK] Logger Initialised");
    await (0, prisma_1.connectPrisma)();
    logger.info("[OK] Prisma Connected");
    (0, lifecycle_1.registerLifecycleHandlers)(logger);
    logger.info("[OK] Lifecycle Registered");
    logger.info("Platform Bootstrap Complete");
    logger.info("==================================================");
}
//# sourceMappingURL=application.js.map
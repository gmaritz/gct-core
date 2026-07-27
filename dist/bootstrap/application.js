"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrapApplication = bootstrapApplication;
const configuration_1 = require("./configuration");
const logging_1 = require("./logging");
const lifecycle_1 = require("./lifecycle");
const prisma_1 = require("./prisma");
const express_1 = require("./express");
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
    const expressApplication = (0, express_1.createExpressApplication)(configuration, logger);
    logger.info("[OK] Express Configured");
    const httpServer = await startHttpServer(expressApplication, configuration.port);
    logger.info("[OK] HTTP Server Listening");
    (0, lifecycle_1.registerLifecycleHandlers)(logger, {
        beforeShutdown: async () => {
            await stopHttpServer(httpServer);
            logger.info("HTTP server stopped");
        },
    });
    logger.info("[OK] Lifecycle Registered");
    logger.info("Platform Ready");
    logger.info(`Listening: http://localhost:${configuration.port}`);
    logger.info("==================================================");
}
function startHttpServer(expressApplication, port) {
    return new Promise((resolve, reject) => {
        const server = expressApplication.listen(port, () => {
            resolve(server);
        });
        server.on("error", (error) => {
            reject(error);
        });
    });
}
function stopHttpServer(server) {
    return new Promise((resolve, reject) => {
        server.close((error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });
}
//# sourceMappingURL=application.js.map
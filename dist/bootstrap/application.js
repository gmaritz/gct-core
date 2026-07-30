"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrapApplication = bootstrapApplication;
const configuration_service_1 = require("../config/configuration.service");
const logging_1 = require("./logging");
const lifecycle_1 = require("./lifecycle");
const prisma_1 = require("./prisma");
const express_1 = require("./express");
const platform_1 = require("../application/platform");
const runtime_1 = require("../application/runtime");
function formatEnvironmentLabel(environment) {
    return `${environment.charAt(0).toUpperCase()}${environment.slice(1)}`;
}
async function bootstrapApplication() {
    const startupStartedAt = process.hrtime.bigint();
    const configuration = (0, configuration_service_1.loadConfiguration)();
    const logger = (0, logging_1.initialiseLogging)();
    const platformInfoService = new platform_1.PlatformInfoService();
    const runtimeManager = new runtime_1.RuntimeManager(logger);
    logger.info("Startup initiated", {
        ...platformInfoService.getPlatformInfo(),
        environmentLabel: formatEnvironmentLabel(configuration.platform.environment),
        nodeVersion: process.version,
        port: configuration.server.port,
        startupTimestamp: platformInfoService.getStartupInfo(configuration.server.port, 0).startupTimestamp,
    });
    logger.info("[OK] Configuration Loaded");
    logger.info("[OK] Logger Initialised");
    await (0, prisma_1.connectPrisma)();
    logger.info("[OK] Prisma Connected");
    const expressApplication = (0, express_1.createExpressApplication)(configuration, logger);
    await runtimeManager.start();
    logger.info("[OK] Express Configured");
    const httpServer = await startHttpServer(expressApplication, configuration.server.port);
    logger.info("[OK] HTTP Server Listening");
    (0, lifecycle_1.registerLifecycleHandlers)(logger, {
        beforeShutdown: async () => {
            await runtimeManager.stop();
            await stopHttpServer(httpServer);
            logger.info("HTTP server stopped");
        },
    });
    const startupDurationMs = Number(process.hrtime.bigint() - startupStartedAt) / 1000000;
    const startupInfo = platformInfoService.getStartupInfo(configuration.server.port, Number(startupDurationMs.toFixed(2)));
    logger.info("[OK] Lifecycle Registered");
    logger.info("Platform Ready", startupInfo);
    logger.info("Listening", { address: `http://localhost:${configuration.server.port}` });
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
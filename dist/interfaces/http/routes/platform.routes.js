"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlatformRouter = createPlatformRouter;
const express_1 = require("express");
const prisma_1 = require("../../../bootstrap/prisma");
const SERVICE_NAME = "gct-core";
const PLATFORM_NAME = "Go Cape Tours Core Platform";
const DEFAULT_VERSION = "1.0.0";
function createPlatformRouter(configuration) {
    const router = (0, express_1.Router)();
    const version = process.env.npm_package_version ?? DEFAULT_VERSION;
    const build = process.env.BUILD_VERSION ?? "development";
    router.get("/", (_request, response) => {
        response.status(200).json({
            service: SERVICE_NAME,
            name: PLATFORM_NAME,
            version,
            environment: configuration.nodeEnv,
        });
    });
    router.get("/version", (_request, response) => {
        response.status(200).json({
            service: SERVICE_NAME,
            version,
            environment: configuration.nodeEnv,
            build,
            timestamp: new Date().toISOString(),
        });
    });
    router.get("/live", (_request, response) => {
        response.status(200).json({
            status: "UP",
        });
    });
    router.get("/ready", (_request, response) => {
        if ((0, prisma_1.isPrismaReady)()) {
            response.status(200).json({
                status: "READY",
            });
            return;
        }
        response.status(503).json({
            status: "NOT_READY",
        });
    });
    router.get("/health", (_request, response) => {
        response.status(200).json({
            status: "UP",
            service: SERVICE_NAME,
            environment: configuration.nodeEnv,
            version,
            timestamp: new Date().toISOString(),
        });
    });
    return router;
}
//# sourceMappingURL=platform.routes.js.map
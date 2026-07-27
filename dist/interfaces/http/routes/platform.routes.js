"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlatformRouter = createPlatformRouter;
const express_1 = require("express");
const platform_1 = require("../../../application/platform");
const prisma_1 = require("../../../bootstrap/prisma");
function createPlatformRouter() {
    const router = (0, express_1.Router)();
    const platformInfoService = new platform_1.PlatformInfoService();
    router.get("/", (_request, response) => {
        response.status(200).json(platformInfoService.getPlatformInfo());
    });
    router.get("/version", (_request, response) => {
        response.status(200).json(platformInfoService.getVersionInfo());
    });
    router.get("/live", (_request, response) => {
        response.status(200).json({
            status: "UP",
        });
    });
    router.get("/ready", (_request, response) => {
        const readinessDiagnostics = {
            database: (0, prisma_1.isPrismaReady)() ? "CONNECTED" : "DISCONNECTED",
            uptimeSeconds: platformInfoService.getUptime(),
            timestamp: new Date().toISOString(),
        };
        if ((0, prisma_1.isPrismaReady)()) {
            response.status(200).json({
                status: "READY",
                ...readinessDiagnostics,
            });
            return;
        }
        response.status(503).json({
            status: "NOT_READY",
            ...readinessDiagnostics,
        });
    });
    router.get("/health", (_request, response) => {
        const platformInfo = platformInfoService.getPlatformInfo();
        response.status(200).json({
            status: "UP",
            service: platformInfo.service,
            environment: platformInfo.environment,
            version: platformInfo.version,
            timestamp: new Date().toISOString(),
        });
    });
    return router;
}
//# sourceMappingURL=platform.routes.js.map
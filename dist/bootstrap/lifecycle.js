"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerLifecycleHandlers = registerLifecycleHandlers;
const logging_1 = require("./logging");
const prisma_1 = require("./prisma");
let handlersRegistered = false;
let shuttingDown = false;
async function handleShutdown(signal, logger) {
    if (shuttingDown) {
        return;
    }
    shuttingDown = true;
    try {
        logger.info(`Shutdown signal received: ${signal}`);
        logger.info("Starting graceful shutdown...");
        await (0, prisma_1.disconnectPrisma)();
        logger.info("Prisma disconnected");
        await (0, logging_1.flushLogger)();
        if (!process.stdin.destroyed) {
            process.stdin.pause();
        }
        process.exit(0);
    }
    catch (error) {
        logger.error("Shutdown failed", error);
        process.exit(1);
    }
}
function registerLifecycleHandlers(logger) {
    if (handlersRegistered) {
        return;
    }
    process.on("SIGINT", () => {
        void handleShutdown("SIGINT", logger);
    });
    process.on("SIGTERM", () => {
        void handleShutdown("SIGTERM", logger);
    });
    if (!process.stdin.destroyed) {
        process.stdin.resume();
    }
    handlersRegistered = true;
}
//# sourceMappingURL=lifecycle.js.map
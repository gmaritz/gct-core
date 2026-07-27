"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialiseLogging = initialiseLogging;
exports.getLogger = getLogger;
exports.flushLogger = flushLogger;
class ConsoleLogger {
    info(message, ...meta) {
        console.info(`[INFO] ${message}`, ...meta);
    }
    warn(message, ...meta) {
        console.warn(`[WARN] ${message}`, ...meta);
    }
    error(message, ...meta) {
        console.error(`[ERROR] ${message}`, ...meta);
    }
}
const logger = new ConsoleLogger();
function initialiseLogging() {
    return logger;
}
function getLogger() {
    return logger;
}
async function flushLogger() {
    return Promise.resolve();
}
//# sourceMappingURL=logging.js.map
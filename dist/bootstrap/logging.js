"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialiseLogging = initialiseLogging;
exports.getLogger = getLogger;
exports.withRequestContext = withRequestContext;
exports.flushLogger = flushLogger;
const metadata_1 = require("../shared/metadata");
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
function extractLogData(meta) {
    let requestId = null;
    const fieldCollection = {};
    const rest = [];
    for (const item of meta) {
        if (isRecord(item)) {
            for (const [key, value] of Object.entries(item)) {
                fieldCollection[key] = value;
            }
            if (requestId === null && typeof item.requestId === "string" && item.requestId.trim().length > 0) {
                requestId = item.requestId;
            }
            continue;
        }
        rest.push(item);
    }
    return {
        requestId,
        fields: Object.keys(fieldCollection).length > 0 ? fieldCollection : undefined,
        rest: rest.length > 0 ? rest : undefined,
    };
}
class ConsoleLogger {
    write(level, message, ...meta) {
        const extracted = extractLogData(meta);
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            service: metadata_1.PLATFORM_METADATA.SERVICE_NAME,
            requestId: extracted.requestId,
            message,
            fields: extracted.fields,
            meta: extracted.rest,
        };
        const serialisedEntry = JSON.stringify(entry);
        if (level === "ERROR") {
            console.error(serialisedEntry);
            return;
        }
        if (level === "WARN") {
            console.warn(serialisedEntry);
            return;
        }
        process.stdout.write(`${serialisedEntry}\n`);
    }
    info(message, ...meta) {
        this.write("INFO", message, ...meta);
    }
    warn(message, ...meta) {
        this.write("WARN", message, ...meta);
    }
    error(message, ...meta) {
        this.write("ERROR", message, ...meta);
    }
}
const logger = new ConsoleLogger();
function initialiseLogging() {
    return logger;
}
function getLogger() {
    return logger;
}
function withRequestContext(loggerInstance, requestId) {
    return {
        info(message, ...meta) {
            loggerInstance.info(message, { requestId }, ...meta);
        },
        warn(message, ...meta) {
            loggerInstance.warn(message, { requestId }, ...meta);
        },
        error(message, ...meta) {
            loggerInstance.error(message, { requestId }, ...meta);
        },
    };
}
async function flushLogger() {
    return Promise.resolve();
}
//# sourceMappingURL=logging.js.map
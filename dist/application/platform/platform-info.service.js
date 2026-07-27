"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformInfoService = void 0;
const metadata_1 = require("../../shared/metadata");
class PlatformInfoService {
    getPlatformInfo() {
        return {
            service: metadata_1.PLATFORM_METADATA.SERVICE_NAME,
            name: metadata_1.PLATFORM_METADATA.PLATFORM_NAME,
            version: metadata_1.PLATFORM_METADATA.VERSION,
            environment: metadata_1.PLATFORM_METADATA.NODE_ENV,
        };
    }
    getVersionInfo() {
        return {
            service: metadata_1.PLATFORM_METADATA.SERVICE_NAME,
            version: metadata_1.PLATFORM_METADATA.VERSION,
            environment: metadata_1.PLATFORM_METADATA.NODE_ENV,
            build: metadata_1.PLATFORM_METADATA.BUILD,
            timestamp: new Date().toISOString(),
        };
    }
    getStartupInfo(port, startupDurationMs) {
        return {
            service: metadata_1.PLATFORM_METADATA.SERVICE_NAME,
            name: metadata_1.PLATFORM_METADATA.PLATFORM_NAME,
            version: metadata_1.PLATFORM_METADATA.VERSION,
            build: metadata_1.PLATFORM_METADATA.BUILD,
            environment: metadata_1.PLATFORM_METADATA.NODE_ENV,
            nodeVersion: process.version,
            port,
            startupTimestamp: metadata_1.PLATFORM_METADATA.START_TIME,
            startupDurationMs,
        };
    }
    getUptime() {
        const startedAtMs = Date.parse(metadata_1.PLATFORM_METADATA.START_TIME);
        const uptimeMs = Date.now() - startedAtMs;
        return Math.max(0, Math.floor(uptimeMs / 1000));
    }
}
exports.PlatformInfoService = PlatformInfoService;
//# sourceMappingURL=platform-info.service.js.map
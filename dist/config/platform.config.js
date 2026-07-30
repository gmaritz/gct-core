"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlatformConfig = createPlatformConfig;
function createPlatformConfig(version, build, environment) {
    return {
        serviceName: "gct-core",
        platformName: "Go Cape Tours Core Platform",
        version,
        build,
        environment,
    };
}
//# sourceMappingURL=platform.config.js.map
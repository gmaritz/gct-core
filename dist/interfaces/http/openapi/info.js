"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOpenApiInfo = createOpenApiInfo;
const platform_1 = require("../../../application/platform");
function createOpenApiInfo() {
    const platformInfoService = new platform_1.PlatformInfoService();
    const platformInfo = platformInfoService.getPlatformInfo();
    return {
        title: "GCT Core API",
        version: platformInfo.version,
        description: "Platform foundation endpoints for the GCT Core service.",
        contact: {
            name: "Go Cape Tours",
            email: "support@gct-core.dev",
        },
        license: {
            name: "ISC",
            url: "https://opensource.org/license/isc",
        },
    };
}
//# sourceMappingURL=info.js.map
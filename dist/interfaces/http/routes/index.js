"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRootRouter = createRootRouter;
const express_1 = require("express");
const api_routes_1 = require("./api.routes");
const platform_routes_1 = require("./platform.routes");
function createRootRouter() {
    const router = (0, express_1.Router)();
    router.use("/", (0, platform_routes_1.createPlatformRouter)());
    router.use("/api", (0, api_routes_1.createApiRouter)());
    return router;
}
//# sourceMappingURL=index.js.map
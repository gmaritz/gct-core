"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiRouter = createApiRouter;
const express_1 = require("express");
const v1_routes_1 = require("./v1.routes");
function createApiRouter() {
    const router = (0, express_1.Router)();
    router.use("/v1", (0, v1_routes_1.createV1Router)());
    return router;
}
//# sourceMappingURL=api.routes.js.map
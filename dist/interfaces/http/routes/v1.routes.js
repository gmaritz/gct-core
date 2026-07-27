"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createV1Router = createV1Router;
const express_1 = require("express");
function createV1Router() {
    const router = (0, express_1.Router)();
    router.get("/", (_request, response) => {
        response.status(200).json({
            message: "GCT Core API v1",
        });
    });
    return router;
}
//# sourceMappingURL=v1.routes.js.map
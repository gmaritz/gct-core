"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createV1Router = createV1Router;
const express_1 = require("express");
const payfast_itn_controller_1 = require("../controllers/payfast-itn.controller");
function createV1Router() {
    const router = (0, express_1.Router)();
    router.get("/", (_request, response) => {
        response.status(200).json({
            message: "GCT Core API v1",
        });
    });
    router.post("/payfast/itn", payfast_itn_controller_1.receivePayFastItn);
    return router;
}
//# sourceMappingURL=v1.routes.js.map
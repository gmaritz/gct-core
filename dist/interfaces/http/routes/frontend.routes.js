"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFrontendRouter = createFrontendRouter;
const express_1 = require("express");
const frontend_controller_1 = require("../controllers/frontend.controller");
function createFrontendRouter() {
    const router = (0, express_1.Router)();
    router.get("/placeholder", frontend_controller_1.renderPlaceholderPage);
    router.get("/404", frontend_controller_1.renderNotFoundPage);
    return router;
}
//# sourceMappingURL=frontend.routes.js.map
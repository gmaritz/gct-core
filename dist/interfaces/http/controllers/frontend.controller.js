"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPlaceholderPage = renderPlaceholderPage;
exports.renderNotFoundPage = renderNotFoundPage;
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const view_models_1 = require("../view-models");
async function renderView(response, viewName, locals) {
    const viewsRoot = path_1.default.join(process.cwd(), "src/interfaces/views");
    const viewPath = path_1.default.join(viewsRoot, `${viewName}.ejs`);
    const markup = await ejs_1.default.renderFile(viewPath, locals, { filename: viewPath, root: viewsRoot });
    response.render("layouts/main", {
        ...locals,
        body: markup,
    });
}
async function renderPlaceholderPage(request, response) {
    const { curatedJourneys } = (0, view_models_1.getHomepageShowcaseViewModel)();
    await renderView(response, "pages/placeholder", {
        title: "GCT Core",
        pageTitle: "Frontend Architecture Foundation",
        currentPath: request.path,
        curatedJourneys,
    });
}
async function renderNotFoundPage(_request, response) {
    await renderView(response, "errors/404", {
        title: "Not Found",
        pageTitle: "Page unavailable",
    });
}
//# sourceMappingURL=frontend.controller.js.map
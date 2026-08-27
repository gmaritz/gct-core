"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPlaceholderPage = renderPlaceholderPage;
exports.renderNotFoundPage = renderNotFoundPage;
exports.renderJourneyDiscoveryPage = renderJourneyDiscoveryPage;
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const view_models_1 = require("../../view-models");
const merchandising_1 = require("../../../application/merchandising");
const view_models_2 = require("../../view-models");
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
    const homepageShowcaseViewModel = await (0, view_models_1.getHomepageShowcaseViewModel)();
    await renderView(response, "pages/placeholder", {
        title: "GCT Core",
        pageTitle: "Frontend Architecture Foundation",
        currentPath: request.path,
        homepageShowcaseViewModel,
    });
}
async function renderNotFoundPage(_request, response) {
    await renderView(response, "errors/404", {
        title: "Not Found",
        pageTitle: "Page unavailable",
    });
}
async function renderJourneyDiscoveryPage(request, response) {
    const resolution = await new merchandising_1.DefaultDynamicHomepageJourneyResolver().resolve(request.params.journeyId);
    if (resolution.status === "INVALID" || resolution.status === "NOT_FOUND") {
        response.status(404);
        await renderNotFoundPage(request, response);
        return;
    }
    if (resolution.status === "UNAVAILABLE" || !resolution.journey) {
        response.status(410);
        await renderView(response, "errors/unavailable", {
            title: "Journey unavailable",
            pageTitle: "Journey unavailable",
            currentPath: request.path,
        });
        return;
    }
    const journeyDiscoveryViewModel = new view_models_2.JourneyDiscoveryViewModelProvider().provide(resolution.journey);
    await renderView(response, "pages/journey-discovery", {
        title: journeyDiscoveryViewModel.title,
        pageTitle: journeyDiscoveryViewModel.title,
        currentPath: request.path,
        journeyDiscoveryViewModel,
    });
}
//# sourceMappingURL=frontend.controller.js.map
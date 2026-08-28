"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPlaceholderPage = renderPlaceholderPage;
exports.renderNotFoundPage = renderNotFoundPage;
exports.renderJourneyDetailPage = renderJourneyDetailPage;
exports.selectJourney = selectJourney;
exports.renderAccommodationSelectionPage = renderAccommodationSelectionPage;
exports.selectAccommodation = selectAccommodation;
exports.renderJourneyQuotePage = renderJourneyQuotePage;
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
async function renderJourneyDetailPage(request, response) {
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
    const journeyDetailViewModel = new view_models_2.JourneyDetailViewModelProvider().provide(resolution.journey);
    await renderView(response, "pages/journey-detail", {
        title: journeyDetailViewModel.title,
        pageTitle: journeyDetailViewModel.title,
        currentPath: request.path,
        journeyDetailViewModel,
    });
}
async function selectJourney(request, response) {
    const result = await new merchandising_1.DefaultDynamicHomepageJourneySelector().selectJourney(request.params.journeyId);
    if (result.status === "INVALID" || result.status === "NOT_FOUND") {
        response.status(404);
        await renderNotFoundPage(request, response);
        return;
    }
    if (result.status === "UNAVAILABLE") {
        response.status(410);
        await renderView(response, "errors/unavailable", {
            title: "Journey unavailable",
            pageTitle: "Journey unavailable",
            currentPath: request.path,
        });
        return;
    }
    await renderView(response, "pages/journey-selected", {
        title: "Journey selected",
        pageTitle: "Journey selected",
        currentPath: request.path,
        selection: result,
        selectionHref: `/ui/journeys/${result.journeyId}/accommodation`,
    });
}
async function renderAccommodationSelectionPage(request, response) {
    const resolution = await new merchandising_1.DefaultDynamicHomepageJourneyResolver().resolve(request.params.journeyId);
    if (resolution.status !== "RESOLVED" || !resolution.journey) {
        response.status(resolution.status === "UNAVAILABLE" ? 410 : 404);
        await renderNotFoundPage(request, response);
        return;
    }
    const accommodationSelectionViewModel = new view_models_2.AccommodationSelectionViewModelProvider().provide(resolution.journey);
    await renderView(response, "pages/accommodation-selection", {
        title: "Select accommodation",
        pageTitle: "Select accommodation",
        currentPath: request.path,
        accommodationSelectionViewModel,
    });
}
async function selectAccommodation(request, response) {
    const body = request.body;
    const selections = Array.isArray(body?.selections) ? body.selections : [];
    const result = await new merchandising_1.DefaultAccommodationSelectionService(new merchandising_1.DefaultDynamicHomepageJourneyResolver())
        .selectAccommodation(request.params.journeyId, selections);
    if (result.status === "INVALID" || result.status === "NOT_FOUND") {
        response.status(404);
        await renderNotFoundPage(request, response);
        return;
    }
    if (result.status === "UNAVAILABLE" || result.status === "STALE") {
        response.status(409);
        await renderView(response, "errors/unavailable", {
            title: "Accommodation unavailable",
            pageTitle: "Accommodation unavailable",
            currentPath: request.path,
        });
        return;
    }
    if (result.status !== "COMPLETE") {
        const resolution = await new merchandising_1.DefaultDynamicHomepageJourneyResolver().resolve(request.params.journeyId);
        if (resolution.status !== "RESOLVED" || !resolution.journey) {
            response.status(404);
            await renderNotFoundPage(request, response);
            return;
        }
        const accommodationSelectionViewModel = new view_models_2.AccommodationSelectionViewModelProvider().provide(resolution.journey, "Select accommodation for every stop.");
        response.status(422);
        await renderView(response, "pages/accommodation-selection", {
            title: "Select accommodation",
            pageTitle: "Select accommodation",
            currentPath: request.path,
            accommodationSelectionViewModel,
        });
        return;
    }
    await renderView(response, "pages/accommodation-selected", {
        title: "Accommodation selected",
        pageTitle: "Accommodation selected",
        currentPath: request.path,
        selection: result,
        quoteHref: `/ui/journeys/${result.journeyId}/quote`,
    });
}
async function renderJourneyQuotePage(request, response) {
    const result = await new merchandising_1.DefaultJourneyQuoteService(new merchandising_1.DefaultDynamicHomepageJourneyResolver(), (0, merchandising_1.createDefaultPricingEngine)()).priceCurrentJourney(request.params.journeyId);
    const quoteViewModel = new view_models_2.JourneyQuoteViewModelProvider().provide(result);
    if (result.status === "INVALID" || result.status === "NOT_FOUND") {
        response.status(404);
        await renderNotFoundPage(request, response);
        return;
    }
    if (result.status === "RECHECK_REQUIRED" || result.status === "UNAVAILABLE") {
        response.status(409);
        await renderView(response, "pages/journey-quote", {
            title: "Quote unavailable",
            pageTitle: "Quote unavailable",
            currentPath: request.path,
            quoteViewModel,
        });
        return;
    }
    await renderView(response, "pages/journey-quote", {
        title: "Journey quote",
        pageTitle: "Journey quote",
        currentPath: request.path,
        quoteViewModel,
    });
}
//# sourceMappingURL=frontend.controller.js.map
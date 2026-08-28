import path from "path";

import ejs from "ejs";
import { Request, Response } from "express";
import { getHomepageShowcaseViewModel } from "../../view-models";
import {
	DefaultAccommodationSelectionService,
	DefaultDynamicHomepageJourneyResolver,
	DefaultDynamicHomepageJourneySelector,
	DefaultJourneyQuoteService,
	createDefaultPricingEngine,
} from "../../../application/merchandising";
import {
	AccommodationSelectionViewModelProvider,
	JourneyDetailViewModelProvider,
	JourneyQuoteViewModelProvider,
} from "../../view-models";

async function renderView(response: Response, viewName: string, locals: Record<string, unknown>): Promise<void> {
	const viewsRoot = path.join(process.cwd(), "src/interfaces/views");
	const viewPath = path.join(viewsRoot, `${viewName}.ejs`);
	const markup = await ejs.renderFile(viewPath, locals, { filename: viewPath, root: viewsRoot });
	response.render("layouts/main", {
		...locals,
		body: markup,
	});
}

export async function renderPlaceholderPage(request: Request, response: Response): Promise<void> {
  const homepageShowcaseViewModel = await getHomepageShowcaseViewModel();

	await renderView(response, "pages/placeholder", {
		title: "GCT Core",
		pageTitle: "Frontend Architecture Foundation",
		currentPath: request.path,
		homepageShowcaseViewModel,
	});
}

export async function renderNotFoundPage(_request: Request, response: Response): Promise<void> {
	await renderView(response, "errors/404", {
		title: "Not Found",
		pageTitle: "Page unavailable",
	});
}

export async function renderJourneyDetailPage(request: Request, response: Response): Promise<void> {
	const resolution = await new DefaultDynamicHomepageJourneyResolver().resolve(request.params.journeyId);

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

	const journeyDetailViewModel = new JourneyDetailViewModelProvider().provide(resolution.journey);
	await renderView(response, "pages/journey-detail", {
		title: journeyDetailViewModel.title,
		pageTitle: journeyDetailViewModel.title,
		currentPath: request.path,
		journeyDetailViewModel,
	});
}

export async function selectJourney(request: Request, response: Response): Promise<void> {
	const result = await new DefaultDynamicHomepageJourneySelector().selectJourney(request.params.journeyId);

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

export async function renderAccommodationSelectionPage(request: Request, response: Response): Promise<void> {
	const resolution = await new DefaultDynamicHomepageJourneyResolver().resolve(request.params.journeyId);

	if (resolution.status !== "RESOLVED" || !resolution.journey) {
		response.status(resolution.status === "UNAVAILABLE" ? 410 : 404);
		await renderNotFoundPage(request, response);
		return;
	}

	const accommodationSelectionViewModel = new AccommodationSelectionViewModelProvider().provide(resolution.journey);
	await renderView(response, "pages/accommodation-selection", {
		title: "Select accommodation",
		pageTitle: "Select accommodation",
		currentPath: request.path,
		accommodationSelectionViewModel,
	});
}

export async function selectAccommodation(request: Request, response: Response): Promise<void> {
	const body = request.body as { selections?: unknown };
	const selections = Array.isArray(body?.selections) ? body.selections : [];
	const result = await new DefaultAccommodationSelectionService(new DefaultDynamicHomepageJourneyResolver())
		.selectAccommodation(request.params.journeyId, selections as never);

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
		const resolution = await new DefaultDynamicHomepageJourneyResolver().resolve(request.params.journeyId);
		if (resolution.status !== "RESOLVED" || !resolution.journey) {
			response.status(404);
			await renderNotFoundPage(request, response);
			return;
		}
		const accommodationSelectionViewModel = new AccommodationSelectionViewModelProvider().provide(resolution.journey, "Select accommodation for every stop.");
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

export async function renderJourneyQuotePage(request: Request, response: Response): Promise<void> {
	const result = await new DefaultJourneyQuoteService(
		new DefaultDynamicHomepageJourneyResolver(),
		createDefaultPricingEngine(),
	).priceCurrentJourney(request.params.journeyId);
	const quoteViewModel = new JourneyQuoteViewModelProvider().provide(result);

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

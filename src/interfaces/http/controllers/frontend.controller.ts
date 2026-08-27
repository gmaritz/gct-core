import path from "path";

import ejs from "ejs";
import { Request, Response } from "express";
import { getHomepageShowcaseViewModel } from "../../view-models";
import { DefaultDynamicHomepageJourneyResolver } from "../../../application/merchandising";
import { JourneyDetailViewModelProvider } from "../../view-models";

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

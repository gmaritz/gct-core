import path from "path";

import ejs from "ejs";
import { Request, Response } from "express";
import { getHomepageShowcaseViewModel } from "../../view-models";
import {
	DefaultAccommodationSelectionService,
	DefaultDynamicHomepageJourneyResolver,
	DefaultDynamicHomepageJourneySelector,
	DefaultJourneyQuoteService,
	DefaultGuestInformationService,
	DefaultReservationReviewService,
	GuestInformationInput,
	createDefaultPricingEngine,
} from "../../../application/merchandising";
import {
	AccommodationSelectionViewModelProvider,
	JourneyDetailViewModelProvider,
	JourneyQuoteViewModelProvider,
	GuestInformationViewModelProvider,
	ReservationReviewViewModelProvider,
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

function renderGuestInformation(
	request: Request,
	response: Response,
	viewModel: ReturnType<GuestInformationViewModelProvider["provide"]>,
	status = 200,
): Promise<void> {
	response.status(status);
	return renderView(response, "pages/guest-information", {
		title: "Guest information",
		pageTitle: "Guest information",
		currentPath: request.path,
		guestInformationViewModel: viewModel,
	});
}

export async function renderGuestInformationPage(request: Request, response: Response): Promise<void> {
	const resolution = await new DefaultDynamicHomepageJourneyResolver().resolve(request.params.journeyId);
	if (resolution.status !== "RESOLVED" || !resolution.journey) {
		response.status(resolution.status === "UNAVAILABLE" ? 410 : 404);
		await renderNotFoundPage(request, response);
		return;
	}

	const viewModel = new GuestInformationViewModelProvider().provide({
		status: "INVALID",
		journeyId: request.params.journeyId,
		journey: resolution.journey,
		errors: [],
	});
	await renderGuestInformation(request, response, viewModel);
}

export async function submitGuestInformation(request: Request, response: Response): Promise<void> {
	const input = toGuestInformationInput(request.body);
	const result = await new DefaultGuestInformationService(new DefaultDynamicHomepageJourneyResolver())
		.captureGuestInformation(request.params.journeyId, input);

	if (result.status === "INVALID") {
		await renderGuestInformation(request, response, new GuestInformationViewModelProvider().provide(result), 422);
		return;
	}
	if (result.status === "NOT_FOUND") {
		response.status(404);
		await renderNotFoundPage(request, response);
		return;
	}
	if (result.status === "UNAVAILABLE") {
		response.status(410);
		await renderView(response, "errors/unavailable", { title: "Journey unavailable", pageTitle: "Journey unavailable", currentPath: request.path });
		return;
	}

	const review = await new DefaultReservationReviewService().review({
		journeyId: request.params.journeyId,
		guestInformation: input,
	});
	await renderReservationReview(request, response, new ReservationReviewViewModelProvider().provide(review), review.status === "READY" ? 200 : 409);
}

function toGuestInformationInput(body: unknown): GuestInformationInput {
	const submitted = body as { contact?: Record<string, string>; leadTravellerIndex?: string; travellers?: unknown };
	return {
		contact: {
			email: submitted.contact?.email ?? "",
			phone: submitted.contact?.phone,
		},
		leadTravellerIndex: Number(submitted.leadTravellerIndex),
		travellers: Array.isArray(submitted.travellers) ? submitted.travellers as GuestInformationInput["travellers"] : [],
	};
}

function renderReservationReview(
	request: Request,
	response: Response,
	viewModel: ReturnType<ReservationReviewViewModelProvider["provide"]>,
	status = 200,
): Promise<void> {
	response.status(status);
	return renderView(response, "pages/reservation-review", {
		title: "Reservation review",
		pageTitle: "Reservation review",
		currentPath: request.path,
		reservationReviewViewModel: viewModel,
	});
}

export async function renderReservationReviewPage(request: Request, response: Response): Promise<void> {
	const resolution = await new DefaultDynamicHomepageJourneyResolver().resolve(request.params.journeyId);
	if (resolution.status !== "RESOLVED" || !resolution.journey) {
		response.status(resolution.status === "UNAVAILABLE" ? 410 : 404);
		await renderNotFoundPage(request, response);
		return;
	}

	const review = new ReservationReviewViewModelProvider().provide({
		status: "INVALID",
		journeyId: request.params.journeyId,
		journey: resolution.journey,
		errors: ["Complete guest information before reviewing the reservation."],
		confirmed: false,
	});
	await renderReservationReview(request, response, review, 422);
}

export async function confirmReservationReview(request: Request, response: Response): Promise<void> {
	const input = toGuestInformationInput(request.body);
	const review = await new DefaultReservationReviewService().review({
		journeyId: request.params.journeyId,
		guestInformation: input,
		confirmed: request.body?.confirmed === "on" || request.body?.confirmed === true,
	});

	if (review.status !== "READY" || !review.confirmed) {
		const errors = review.status === "READY" && !review.confirmed
			? ["Confirm the reviewed information before continuing to payment."]
			: review.errors;
		await renderReservationReview(request, response, new ReservationReviewViewModelProvider().provide({ ...review, status: review.status, errors }), review.status === "READY" ? 422 : 409);
		return;
	}

	await renderView(response, "pages/payment-handoff", {
		title: "Continue to payment",
		pageTitle: "Continue to payment",
		currentPath: request.path,
		journeyId: review.journeyId,
	});
}

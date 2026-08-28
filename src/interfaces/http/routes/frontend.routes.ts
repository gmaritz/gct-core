import { Router } from "express";

import {
	renderAccommodationSelectionPage,
	renderGuestInformationPage,
	renderJourneyDetailPage,
	renderJourneyQuotePage,
	renderReservationReviewPage,
	renderNotFoundPage,
	renderPlaceholderPage,
	selectAccommodation,
	selectJourney,
	submitGuestInformation,
	confirmReservationReview,
} from "../controllers/frontend.controller";

export function createFrontendRouter(): Router {
	const router = Router();

	router.get("/placeholder", renderPlaceholderPage);
	router.get("/journeys/:journeyId", renderJourneyDetailPage);
	router.post("/journeys/:journeyId/select", selectJourney);
	router.get("/journeys/:journeyId/accommodation", renderAccommodationSelectionPage);
	router.post("/journeys/:journeyId/accommodation", selectAccommodation);
	router.get("/journeys/:journeyId/quote", renderJourneyQuotePage);
	router.get("/journeys/:journeyId/guest-information", renderGuestInformationPage);
	router.post("/journeys/:journeyId/guest-information", submitGuestInformation);
	router.get("/journeys/:journeyId/review", renderReservationReviewPage);
	router.post("/journeys/:journeyId/review", confirmReservationReview);
	router.get("/404", renderNotFoundPage);

	return router;
}

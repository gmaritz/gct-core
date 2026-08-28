import { Router } from "express";

import {
	renderAccommodationSelectionPage,
	renderJourneyDetailPage,
	renderNotFoundPage,
	renderPlaceholderPage,
	selectAccommodation,
	selectJourney,
} from "../controllers/frontend.controller";

export function createFrontendRouter(): Router {
	const router = Router();

	router.get("/placeholder", renderPlaceholderPage);
	router.get("/journeys/:journeyId", renderJourneyDetailPage);
	router.post("/journeys/:journeyId/select", selectJourney);
	router.get("/journeys/:journeyId/accommodation", renderAccommodationSelectionPage);
	router.post("/journeys/:journeyId/accommodation", selectAccommodation);
	router.get("/404", renderNotFoundPage);

	return router;
}

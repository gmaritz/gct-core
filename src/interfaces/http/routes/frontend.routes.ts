import { Router } from "express";

import { renderJourneyDetailPage, renderNotFoundPage, renderPlaceholderPage, selectJourney } from "../controllers/frontend.controller";

export function createFrontendRouter(): Router {
	const router = Router();

	router.get("/placeholder", renderPlaceholderPage);
	router.get("/journeys/:journeyId", renderJourneyDetailPage);
	router.post("/journeys/:journeyId/select", selectJourney);
	router.get("/404", renderNotFoundPage);

	return router;
}

import { Router } from "express";

import { renderJourneyDetailPage, renderNotFoundPage, renderPlaceholderPage } from "../controllers/frontend.controller";

export function createFrontendRouter(): Router {
	const router = Router();

	router.get("/placeholder", renderPlaceholderPage);
	router.get("/journeys/:journeyId", renderJourneyDetailPage);
	router.get("/404", renderNotFoundPage);

	return router;
}

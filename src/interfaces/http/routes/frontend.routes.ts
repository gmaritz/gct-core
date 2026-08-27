import { Router } from "express";

import { renderJourneyDiscoveryPage, renderNotFoundPage, renderPlaceholderPage } from "../controllers/frontend.controller";

export function createFrontendRouter(): Router {
	const router = Router();

	router.get("/placeholder", renderPlaceholderPage);
	router.get("/journeys/:journeyId", renderJourneyDiscoveryPage);
	router.get("/404", renderNotFoundPage);

	return router;
}

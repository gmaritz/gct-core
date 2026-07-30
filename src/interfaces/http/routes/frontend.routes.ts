import { Router } from "express";

import { renderNotFoundPage, renderPlaceholderPage } from "../controllers/frontend.controller";

export function createFrontendRouter(): Router {
	const router = Router();

	router.get("/placeholder", renderPlaceholderPage);
	router.get("/404", renderNotFoundPage);

	return router;
}

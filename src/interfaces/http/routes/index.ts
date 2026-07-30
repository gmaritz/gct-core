import { Router } from "express";

import { createApiRouter } from "./api.routes";
import { createFrontendRouter } from "./frontend.routes";
import { createPlatformRouter } from "./platform.routes";

export function createRootRouter(): Router {
	const router = Router();

	router.use("/", createPlatformRouter());
	router.use("/api", createApiRouter());
	router.use("/ui", createFrontendRouter());

	return router;
}

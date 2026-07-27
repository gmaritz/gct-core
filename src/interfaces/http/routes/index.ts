import { Router } from "express";

import { createApiRouter } from "./api.routes";
import { createPlatformRouter } from "./platform.routes";

export function createRootRouter(): Router {
	const router = Router();

	router.use("/", createPlatformRouter());
	router.use("/api", createApiRouter());

	return router;
}

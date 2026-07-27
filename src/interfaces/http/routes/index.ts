import { Router } from "express";

import { AppConfiguration } from "../../../bootstrap/configuration";
import { createApiRouter } from "./api.routes";
import { createPlatformRouter } from "./platform.routes";

export function createRootRouter(configuration: AppConfiguration): Router {
	const router = Router();

	router.use("/", createPlatformRouter(configuration));
	router.use("/api", createApiRouter());

	return router;
}

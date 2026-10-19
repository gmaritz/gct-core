import { Router } from "express";
import { AnonymousSessionService } from "../../../application/sessions";
import { AnonymousSessionCookiePolicy } from "../middleware/anonymous-session.middleware";

import { createApiRouter } from "./api.routes";
import { createFrontendRouter } from "./frontend.routes";
import { createPlatformRouter } from "./platform.routes";

export function createRootRouter(
	sessionService: AnonymousSessionService,
	sessionCookiePolicy: AnonymousSessionCookiePolicy,
): Router {
	const router = Router();

	router.use("/", createPlatformRouter());
	router.use("/api", createApiRouter());
	router.use("/ui", createFrontendRouter(sessionService, sessionCookiePolicy));

	return router;
}

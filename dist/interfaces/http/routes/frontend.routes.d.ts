import { Router } from "express";
import { AnonymousSessionService } from "../../../application/sessions";
import { AnonymousSessionCookiePolicy } from "../middleware/anonymous-session.middleware";
export declare function createFrontendRouter(sessionService: AnonymousSessionService, sessionCookiePolicy: AnonymousSessionCookiePolicy): Router;
//# sourceMappingURL=frontend.routes.d.ts.map
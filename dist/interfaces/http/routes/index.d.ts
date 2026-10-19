import { Router } from "express";
import { AnonymousSessionService } from "../../../application/sessions";
import { AnonymousSessionCookiePolicy } from "../middleware/anonymous-session.middleware";
export declare function createRootRouter(sessionService: AnonymousSessionService, sessionCookiePolicy: AnonymousSessionCookiePolicy): Router;
//# sourceMappingURL=index.d.ts.map
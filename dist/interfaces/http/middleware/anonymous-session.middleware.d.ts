import { NextFunction, Request, Response } from "express";
import { AnonymousSessionService } from "../../../application/sessions";
export interface AnonymousSessionCookiePolicy {
    readonly cookieName: string;
    readonly cookiePath: string;
    readonly sameSite: "lax";
    readonly secure: boolean;
    readonly lifetimeSeconds: number;
}
export declare const ANONYMOUS_SESSION_COOKIE_NAME = "gct.sid";
export declare const ANONYMOUS_SESSION_COOKIE_PATH = "/ui";
export type AnonymousSessionResolution = "VALID_COOKIE" | "NEW_NO_COOKIE" | "NEW_INVALID_COOKIE";
export interface AnonymousSessionRequestContext {
    readonly ownerId: string;
    readonly expiresAt: Date;
    readonly resolution: AnonymousSessionResolution;
}
declare module "express-serve-static-core" {
    interface Request {
        anonymousSession?: AnonymousSessionRequestContext;
    }
}
export declare function clearAnonymousSessionCookie(response: Response, policy: AnonymousSessionCookiePolicy): void;
export declare function requireAnonymousSession(request: Request): AnonymousSessionRequestContext;
export declare function invalidateAnonymousSession(request: Request, response: Response, service: AnonymousSessionService, policy: AnonymousSessionCookiePolicy): Promise<void>;
export declare function createAnonymousSessionMiddleware(service: AnonymousSessionService, policy: AnonymousSessionCookiePolicy): (request: Request, response: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=anonymous-session.middleware.d.ts.map
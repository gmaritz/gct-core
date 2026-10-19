import { timingSafeEqual } from "crypto";
import { NextFunction, Request, Response } from "express";

import {
	AnonymousSessionOwner,
	AnonymousSessionService,
	IssuedAnonymousSession,
} from "../../../application/sessions";
import { ForbiddenError, UnauthorizedError } from "../errors";

export interface AnonymousSessionCookiePolicy {
	readonly cookieName: string;
	readonly cookiePath: string;
	readonly sameSite: "lax";
	readonly secure: boolean;
	readonly lifetimeSeconds: number;
}

export const ANONYMOUS_SESSION_COOKIE_NAME = "gct.sid";
export const ANONYMOUS_SESSION_COOKIE_PATH = "/ui";

export type AnonymousSessionResolution =
	| "VALID_COOKIE"
	| "NEW_NO_COOKIE"
	| "NEW_INVALID_COOKIE";

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

type ResolvedSession = AnonymousSessionOwner & { readonly csrfToken: string };

function readSessionCookie(request: Request, cookieName: string): { present: boolean; value?: string } {
	const header = request.headers.cookie;
	if (typeof header !== "string") return { present: false };

	const matches = header.split(";").map((part) => part.trim())
		.filter((part) => part.startsWith(`${cookieName}=`));
	if (matches.length === 0) return { present: false };
	if (matches.length !== 1) return { present: true };

	const value = matches[0]!.slice(cookieName.length + 1);
	return /^[A-Za-z0-9_-]{43}$/.test(value) ? { present: true, value } : { present: true };
}

function serializeSessionCookie(
	session: IssuedAnonymousSession,
	policy: AnonymousSessionCookiePolicy,
): string {
	const attributes = [
		`${policy.cookieName}=${session.sessionId}`,
		`Path=${policy.cookiePath}`,
		`Max-Age=${policy.lifetimeSeconds}`,
		`Expires=${session.expiresAt.toUTCString()}`,
		"HttpOnly",
		`SameSite=${policy.sameSite === "lax" ? "Lax" : policy.sameSite}`,
	];
	if (policy.secure) attributes.push("Secure");
	return attributes.join("; ");
}

export function clearAnonymousSessionCookie(
	response: Response,
	policy: AnonymousSessionCookiePolicy,
): void {
	const attributes = [
		`${policy.cookieName}=`,
		`Path=${policy.cookiePath}`,
		"Max-Age=0",
		"Expires=Thu, 01 Jan 1970 00:00:00 GMT",
		"HttpOnly",
		`SameSite=${policy.sameSite === "lax" ? "Lax" : policy.sameSite}`,
	];
	if (policy.secure) attributes.push("Secure");
	response.append("Set-Cookie", attributes.join("; "));
}

export function requireAnonymousSession(request: Request): AnonymousSessionRequestContext {
	if (!request.anonymousSession) throw new UnauthorizedError("A valid anonymous session is required.");
	return request.anonymousSession;
}

export async function invalidateAnonymousSession(
	request: Request,
	response: Response,
	service: AnonymousSessionService,
	policy: AnonymousSessionCookiePolicy,
): Promise<void> {
	const session = requireAnonymousSession(request);
	await service.invalidate(session.ownerId);
	request.anonymousSession = undefined;
	clearAnonymousSessionCookie(response, policy);
}

export function createAnonymousSessionMiddleware(
	service: AnonymousSessionService,
	policy: AnonymousSessionCookiePolicy,
) {
	return async (request: Request, response: Response, next: NextFunction): Promise<void> => {
		try {
			const presentedCookie = readSessionCookie(request, policy.cookieName);
			let resolved: ResolvedSession | null = null;
			if (presentedCookie.value) resolved = await service.resolve(presentedCookie.value);

			let resolution: AnonymousSessionResolution = "VALID_COOKIE";
			let owner: ResolvedSession;
			if (resolved) {
				owner = resolved;
			} else {
				resolution = presentedCookie.present ? "NEW_INVALID_COOKIE" : "NEW_NO_COOKIE";
				const issued = await service.create();
				owner = {
					ownerId: issued.ownerId,
					csrfToken: issued.csrfToken,
					expiresAt: issued.expiresAt,
				};
				response.append("Set-Cookie", serializeSessionCookie(issued, policy));
			}

			request.anonymousSession = {
				ownerId: owner.ownerId,
				expiresAt: owner.expiresAt,
				resolution,
			};
			response.locals.csrfToken = owner.csrfToken;
			response.locals.anonymousSessionExpiresAt = owner.expiresAt;

			const safeMethod = ["GET", "HEAD", "OPTIONS"].includes(request.method.toUpperCase());
			if (!safeMethod && (
				resolution !== "VALID_COOKIE"
				|| !isValidCsrfToken(request, owner.csrfToken)
			)) {
				next(new ForbiddenError("A valid CSRF token is required."));
				return;
			}

			next();
		} catch (error) {
			next(error);
		}
	};
}

function isValidCsrfToken(request: Request, expected: string): boolean {
	const submitted = request.get("X-CSRF-Token")
		?? (typeof request.body?._csrf === "string" ? request.body._csrf : undefined);
	if (!submitted || submitted.length !== expected.length) return false;
	return timingSafeEqual(Buffer.from(submitted), Buffer.from(expected));
}

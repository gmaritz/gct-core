"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ANONYMOUS_SESSION_COOKIE_PATH = exports.ANONYMOUS_SESSION_COOKIE_NAME = void 0;
exports.clearAnonymousSessionCookie = clearAnonymousSessionCookie;
exports.requireAnonymousSession = requireAnonymousSession;
exports.invalidateAnonymousSession = invalidateAnonymousSession;
exports.createAnonymousSessionMiddleware = createAnonymousSessionMiddleware;
const crypto_1 = require("crypto");
const errors_1 = require("../errors");
exports.ANONYMOUS_SESSION_COOKIE_NAME = "gct.sid";
exports.ANONYMOUS_SESSION_COOKIE_PATH = "/ui";
function readSessionCookie(request, cookieName) {
    const header = request.headers.cookie;
    if (typeof header !== "string")
        return { present: false };
    const matches = header.split(";").map((part) => part.trim())
        .filter((part) => part.startsWith(`${cookieName}=`));
    if (matches.length === 0)
        return { present: false };
    if (matches.length !== 1)
        return { present: true };
    const value = matches[0].slice(cookieName.length + 1);
    return /^[A-Za-z0-9_-]{43}$/.test(value) ? { present: true, value } : { present: true };
}
function serializeSessionCookie(session, policy) {
    const attributes = [
        `${policy.cookieName}=${session.sessionId}`,
        `Path=${policy.cookiePath}`,
        `Max-Age=${policy.lifetimeSeconds}`,
        `Expires=${session.expiresAt.toUTCString()}`,
        "HttpOnly",
        `SameSite=${policy.sameSite === "lax" ? "Lax" : policy.sameSite}`,
    ];
    if (policy.secure)
        attributes.push("Secure");
    return attributes.join("; ");
}
function clearAnonymousSessionCookie(response, policy) {
    const attributes = [
        `${policy.cookieName}=`,
        `Path=${policy.cookiePath}`,
        "Max-Age=0",
        "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
        "HttpOnly",
        `SameSite=${policy.sameSite === "lax" ? "Lax" : policy.sameSite}`,
    ];
    if (policy.secure)
        attributes.push("Secure");
    response.append("Set-Cookie", attributes.join("; "));
}
function requireAnonymousSession(request) {
    if (!request.anonymousSession)
        throw new errors_1.UnauthorizedError("A valid anonymous session is required.");
    return request.anonymousSession;
}
async function invalidateAnonymousSession(request, response, service, policy) {
    const session = requireAnonymousSession(request);
    await service.invalidate(session.ownerId);
    request.anonymousSession = undefined;
    clearAnonymousSessionCookie(response, policy);
}
function createAnonymousSessionMiddleware(service, policy) {
    return async (request, response, next) => {
        try {
            const presentedCookie = readSessionCookie(request, policy.cookieName);
            let resolved = null;
            if (presentedCookie.value)
                resolved = await service.resolve(presentedCookie.value);
            let resolution = "VALID_COOKIE";
            let owner;
            if (resolved) {
                owner = resolved;
            }
            else {
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
            if (!safeMethod && (resolution !== "VALID_COOKIE"
                || !isValidCsrfToken(request, owner.csrfToken))) {
                next(new errors_1.ForbiddenError("A valid CSRF token is required."));
                return;
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
function isValidCsrfToken(request, expected) {
    const submitted = request.get("X-CSRF-Token")
        ?? (typeof request.body?._csrf === "string" ? request.body._csrf : undefined);
    if (!submitted || submitted.length !== expected.length)
        return false;
    return (0, crypto_1.timingSafeEqual)(Buffer.from(submitted), Buffer.from(expected));
}
//# sourceMappingURL=anonymous-session.middleware.js.map
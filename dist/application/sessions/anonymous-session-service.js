"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonymousSessionService = void 0;
const crypto_1 = require("crypto");
const anonymous_session_1 = require("./anonymous-session");
const SESSION_ID_BYTES = 32;
const CSRF_TOKEN_BYTES = 32;
function hashSessionId(sessionId) {
    return (0, crypto_1.createHash)("sha256").update(sessionId).digest("hex");
}
class AnonymousSessionService {
    constructor(repository, lifetimeSeconds, now = () => new Date()) {
        this.repository = repository;
        this.lifetimeSeconds = lifetimeSeconds;
        this.now = now;
        if (!Number.isInteger(lifetimeSeconds) || lifetimeSeconds < 1) {
            throw new Error("Anonymous session lifetime must be a positive number of seconds.");
        }
    }
    async create() {
        const createdAt = this.now();
        const expiresAt = new Date(createdAt.getTime() + this.lifetimeSeconds * 1000);
        const sessionId = (0, crypto_1.randomBytes)(SESSION_ID_BYTES).toString("base64url");
        const csrfToken = (0, crypto_1.randomBytes)(CSRF_TOKEN_BYTES).toString("base64url");
        const record = await this.repository.create({
            tokenHash: hashSessionId(sessionId),
            csrfToken,
            createdAt,
            expiresAt,
        });
        return {
            ownerId: record.id,
            sessionId,
            csrfToken: record.csrfToken,
            expiresAt: record.expiresAt,
        };
    }
    async resolve(sessionId) {
        if (!(0, anonymous_session_1.isAnonymousSessionId)(sessionId))
            return null;
        const now = this.now();
        const record = await this.repository.findActiveByTokenHash(hashSessionId(sessionId), now);
        if (!record || record.expiresAt.getTime() <= now.getTime())
            return null;
        return {
            ownerId: record.id,
            csrfToken: record.csrfToken,
            expiresAt: record.expiresAt,
        };
    }
    async invalidate(ownerId) {
        if (!ownerId.trim())
            throw new Error("An anonymous session owner is required for invalidation.");
        await this.repository.revokeById(ownerId, this.now());
    }
}
exports.AnonymousSessionService = AnonymousSessionService;
//# sourceMappingURL=anonymous-session-service.js.map
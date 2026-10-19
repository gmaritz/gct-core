import { createHash, randomBytes } from "crypto";

import {
	AnonymousSessionRepository,
	AnonymousSessionOwner,
	IssuedAnonymousSession,
	isAnonymousSessionId,
} from "./anonymous-session";

const SESSION_ID_BYTES = 32;
const CSRF_TOKEN_BYTES = 32;

function hashSessionId(sessionId: string): string {
	return createHash("sha256").update(sessionId).digest("hex");
}

export class AnonymousSessionService {
	public constructor(
		private readonly repository: AnonymousSessionRepository,
		private readonly lifetimeSeconds: number,
		private readonly now: () => Date = (): Date => new Date(),
	) {
		if (!Number.isInteger(lifetimeSeconds) || lifetimeSeconds < 1) {
			throw new Error("Anonymous session lifetime must be a positive number of seconds.");
		}
	}

	public async create(): Promise<IssuedAnonymousSession> {
		const createdAt = this.now();
		const expiresAt = new Date(createdAt.getTime() + this.lifetimeSeconds * 1000);
		const sessionId = randomBytes(SESSION_ID_BYTES).toString("base64url");
		const csrfToken = randomBytes(CSRF_TOKEN_BYTES).toString("base64url");
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

	public async resolve(sessionId: string): Promise<(AnonymousSessionOwner & { readonly csrfToken: string }) | null> {
		if (!isAnonymousSessionId(sessionId)) return null;

		const now = this.now();
		const record = await this.repository.findActiveByTokenHash(hashSessionId(sessionId), now);
		if (!record || record.expiresAt.getTime() <= now.getTime()) return null;

		return {
			ownerId: record.id,
			csrfToken: record.csrfToken,
			expiresAt: record.expiresAt,
		};
	}

	public async invalidate(ownerId: string): Promise<void> {
		if (!ownerId.trim()) throw new Error("An anonymous session owner is required for invalidation.");
		await this.repository.revokeById(ownerId, this.now());
	}
}

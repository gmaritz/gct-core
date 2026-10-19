export interface AnonymousSessionRecord {
	readonly id: string;
	readonly csrfToken: string;
	readonly createdAt: Date;
	readonly expiresAt: Date;
}

export interface NewAnonymousSessionRecord {
	readonly tokenHash: string;
	readonly csrfToken: string;
	readonly createdAt: Date;
	readonly expiresAt: Date;
}

export interface AnonymousSessionRepository {
	create(record: NewAnonymousSessionRecord): Promise<AnonymousSessionRecord>;
	findActiveByTokenHash(tokenHash: string, now: Date): Promise<AnonymousSessionRecord | null>;
	revokeById(id: string, revokedAt: Date): Promise<void>;
}

export interface IssuedAnonymousSession {
	readonly ownerId: string;
	readonly sessionId: string;
	readonly csrfToken: string;
	readonly expiresAt: Date;
}

export interface AnonymousSessionOwner {
	readonly ownerId: string;
	readonly expiresAt: Date;
}

const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export function isAnonymousSessionId(value: string): boolean {
	return SESSION_ID_PATTERN.test(value);
}

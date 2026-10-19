import {
	AnonymousSessionRecord,
	AnonymousSessionRepository,
	NewAnonymousSessionRecord,
} from "./anonymous-session";
import { AnonymousSessionService } from "./anonymous-session-service";

class InMemoryAnonymousSessionRepository implements AnonymousSessionRepository {
	public readonly records = new Map<string, AnonymousSessionRecord & { tokenHash: string; revokedAt?: Date }>();

	public async create(record: NewAnonymousSessionRecord): Promise<AnonymousSessionRecord> {
		const created = { ...record, id: `owner-${this.records.size + 1}` };
		this.records.set(created.id, created);
		return created;
	}

	public async findActiveByTokenHash(tokenHash: string, now: Date): Promise<AnonymousSessionRecord | null> {
		const record = [...this.records.values()].find((candidate) =>
			candidate.tokenHash === tokenHash
			&& !candidate.revokedAt
			&& candidate.expiresAt > now,
		);
		return record ?? null;
	}

	public async revokeById(id: string, revokedAt: Date): Promise<void> {
		const record = this.records.get(id);
		if (record && !record.revokedAt) this.records.set(id, { ...record, revokedAt });
	}
}

describe("AnonymousSessionService", () => {
	const now = new Date("2026-10-19T10:00:00.000Z");
	let repository: InMemoryAnonymousSessionRepository;
	let service: AnonymousSessionService;

	beforeEach(() => {
		repository = new InMemoryAnonymousSessionRepository();
		service = new AnonymousSessionService(repository, 3600, () => now);
	});

	it("issues an opaque unpredictable identifier and persists only its hash", async () => {
		const first = await service.create();
		const second = await service.create();

		expect(first.sessionId).toMatch(/^[A-Za-z0-9_-]{43}$/);
		expect(first.sessionId).not.toBe(second.sessionId);
		expect(first.ownerId).toBe("owner-1");
		expect(repository.records.get(first.ownerId)?.tokenHash).not.toBe(first.sessionId);
		expect(repository.records.get(first.ownerId)?.expiresAt).toEqual(new Date(now.getTime() + 3600000));
	});

	it("resolves an issued identifier to its server-derived owner", async () => {
		const issued = await service.create();

		await expect(service.resolve(issued.sessionId)).resolves.toEqual({
			ownerId: issued.ownerId,
			csrfToken: issued.csrfToken,
			expiresAt: issued.expiresAt,
		});
	});

	it("rejects malformed, unknown, expired, and invalidated identifiers", async () => {
		const issued = await service.create();
		await expect(service.resolve("client-selected-owner")).resolves.toBeNull();
		await expect(service.resolve("A".repeat(43))).resolves.toBeNull();

		const expiredRepository = new InMemoryAnonymousSessionRepository();
		const expiredService = new AnonymousSessionService(expiredRepository, 1, () => now);
		const expired = await expiredService.create();
		const afterExpiry = new AnonymousSessionService(expiredRepository, 1, () => new Date(now.getTime() + 1000));
		await expect(afterExpiry.resolve(expired.sessionId)).resolves.toBeNull();

		await service.invalidate(issued.ownerId);
		await expect(service.resolve(issued.sessionId)).resolves.toBeNull();
	});

	it("does not grant access when persistence fails", async () => {
		const failingRepository: AnonymousSessionRepository = {
			create: async () => { throw new Error("database unavailable"); },
			findActiveByTokenHash: async () => { throw new Error("database unavailable"); },
			revokeById: async () => { throw new Error("database unavailable"); },
		};
		const failingService = new AnonymousSessionService(failingRepository, 3600, () => now);

		await expect(failingService.create()).rejects.toThrow("database unavailable");
		await expect(failingService.resolve("A".repeat(43))).rejects.toThrow("database unavailable");
	});
});

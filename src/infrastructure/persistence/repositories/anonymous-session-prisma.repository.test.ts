import { AnonymousSessionPrismaRepository } from "./anonymous-session-prisma.repository";

function prisma(overrides: Record<string, unknown> = {}): ConstructorParameters<typeof AnonymousSessionPrismaRepository>[0] {
	return {
		anonymousSession: {
			create: async () => ({
				id: "session-record-001",
				csrfToken: "csrf",
				createdAt: new Date("2026-10-19T10:00:00.000Z"),
				expiresAt: new Date("2026-10-19T11:00:00.000Z"),
			}),
			findFirst: async () => null,
			updateMany: async () => ({ count: 1 }),
		},
		...overrides,
	} as unknown as ConstructorParameters<typeof AnonymousSessionPrismaRepository>[0];
}

describe("AnonymousSessionPrismaRepository", () => {
	it("creates a session through the Prisma boundary", async () => {
		const create = jest.fn(async () => ({
			id: "session-record-001",
			csrfToken: "csrf",
			createdAt: new Date("2026-10-19T10:00:00.000Z"),
			expiresAt: new Date("2026-10-19T11:00:00.000Z"),
		}));
		const repository = new AnonymousSessionPrismaRepository(prisma({
			anonymousSession: { create, findFirst: jest.fn(), updateMany: jest.fn() },
		}));
		const createdAt = new Date("2026-10-19T10:00:00.000Z");
		const expiresAt = new Date("2026-10-19T11:00:00.000Z");

		await repository.create({ tokenHash: "hash", csrfToken: "csrf", createdAt, expiresAt });

		expect(create).toHaveBeenCalledWith({
			data: { tokenHash: "hash", csrfToken: "csrf", createdAt, expiresAt },
			select: { id: true, csrfToken: true, createdAt: true, expiresAt: true },
		});
	});

	it("queries only active, unrevoked sessions", async () => {
		const findFirst = jest.fn(async () => null);
		const repository = new AnonymousSessionPrismaRepository(prisma({
			anonymousSession: { create: jest.fn(), findFirst, updateMany: jest.fn() },
		}));
		const now = new Date("2026-10-19T10:00:00.000Z");

		await repository.findActiveByTokenHash("hash", now);

		expect(findFirst).toHaveBeenCalledWith({
			where: { tokenHash: "hash", revokedAt: null, expiresAt: { gt: now } },
			select: { id: true, csrfToken: true, createdAt: true, expiresAt: true },
		});
	});

	it("invalidates the session atomically when it has not already been revoked", async () => {
		const updateMany = jest.fn(async () => ({ count: 1 }));
		const repository = new AnonymousSessionPrismaRepository(prisma({
			anonymousSession: { create: jest.fn(), findFirst: jest.fn(), updateMany },
		}));
		const revokedAt = new Date("2026-10-19T10:05:00.000Z");

		await repository.revokeById("session-record-001", revokedAt);

		expect(updateMany).toHaveBeenCalledWith({
			where: { id: "session-record-001", revokedAt: null },
			data: { revokedAt },
		});
	});
});

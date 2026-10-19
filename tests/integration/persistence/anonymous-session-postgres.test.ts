import { createHash, randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";

import { AnonymousSessionService } from "../../../src/application/sessions";
import { AnonymousSessionPrismaRepository } from "../../../src/infrastructure/persistence/repositories/anonymous-session-prisma.repository";

function hashSessionId(sessionId: string): string {
	return createHash("sha256").update(sessionId).digest("hex");
}

function assertLocalDevelopmentDatabase(): void {
	const configuredUrl = process.env.DATABASE_URL;
	if (!configuredUrl) throw new Error("PostgreSQL session verification requires DATABASE_URL.");

	let databaseUrl: URL;
	try {
		databaseUrl = new URL(configuredUrl);
	} catch {
		throw new Error("PostgreSQL session verification requires a valid DATABASE_URL.");
	}

	const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
	const databaseName = decodeURIComponent(databaseUrl.pathname.slice(1));
	if (!localHosts.has(databaseUrl.hostname) || databaseName !== "gct_core") {
		throw new Error("PostgreSQL session verification is restricted to the local gct_core development database.");
	}
}

describe("Anonymous session PostgreSQL persistence", () => {
	let prisma: PrismaClient;
	let repository: AnonymousSessionPrismaRepository;
	let service: AnonymousSessionService;
	const createdTokenHashes: string[] = [];

	beforeAll(async () => {
		assertLocalDevelopmentDatabase();
		prisma = new PrismaClient();
		await prisma.$connect();
		repository = new AnonymousSessionPrismaRepository(prisma);
		service = new AnonymousSessionService(repository, 3600);
	});

	afterAll(async () => {
		if (!prisma) return;
		try {
			if (createdTokenHashes.length > 0) {
				await prisma.anonymousSession.deleteMany({
					where: { tokenHash: { in: createdTokenHashes } },
				});
			}
		} finally {
			await prisma.$disconnect();
		}
	});

	it("persists, resolves, expires, invalidates, and rejects unknown identifiers across fresh service instances", async () => {
		const issued = await service.create();
		const issuedHash = hashSessionId(issued.sessionId);
		createdTokenHashes.push(issuedHash);

		const persisted = await prisma.anonymousSession.findUnique({
			where: { tokenHash: issuedHash },
			select: { id: true, tokenHash: true, expiresAt: true, revokedAt: true },
		});
		expect(persisted).not.toBeNull();
		expect(persisted?.id).toBe(issued.ownerId);
		expect(persisted?.tokenHash).toBe(issuedHash);
		expect(persisted?.tokenHash).not.toBe(issued.sessionId);
		expect(persisted?.revokedAt).toBeNull();

		const freshPrisma = new PrismaClient();
		await freshPrisma.$connect();
		try {
			const freshService = new AnonymousSessionService(
				new AnonymousSessionPrismaRepository(freshPrisma),
				3600,
			);
			await expect(freshService.resolve(issued.sessionId)).resolves.toMatchObject({
				ownerId: issued.ownerId,
				csrfToken: issued.csrfToken,
			});

			const unknownSessionId = randomBytes(32).toString("base64url");
			await expect(freshService.resolve(unknownSessionId)).resolves.toBeNull();

			const expiredSessionId = randomBytes(32).toString("base64url");
			const expiredHash = hashSessionId(expiredSessionId);
			createdTokenHashes.push(expiredHash);
			const now = new Date();
			const expiredRecord = await repository.create({
				tokenHash: expiredHash,
				csrfToken: randomBytes(32).toString("base64url"),
				createdAt: new Date(now.getTime() - 7200000),
				expiresAt: new Date(now.getTime() - 3600000),
			});
			await expect(freshService.resolve(expiredSessionId)).resolves.toBeNull();
			await expect(freshPrisma.anonymousSession.findUnique({
				where: { tokenHash: expiredHash },
				select: { id: true },
			})).resolves.toEqual({ id: expiredRecord.id });

			await service.invalidate(issued.ownerId);
			await expect(freshService.resolve(issued.sessionId)).resolves.toBeNull();
			await expect(freshPrisma.anonymousSession.findUnique({
				where: { tokenHash: issuedHash },
				select: { revokedAt: true },
			})).resolves.toMatchObject({ revokedAt: expect.any(Date) });
		} finally {
			await freshPrisma.$disconnect();
		}
	});
});

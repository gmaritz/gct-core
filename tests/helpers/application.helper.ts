import { Express } from "express";
import { randomUUID } from "crypto";

import { createExpressApplication } from "../../src/bootstrap/express";
import { initialiseLogging } from "../../src/bootstrap/logging";
import { connectPrisma } from "../../src/bootstrap/prisma";
import { loadConfiguration } from "../../src/config/configuration.service";
import {
	AnonymousSessionRecord,
	AnonymousSessionRepository,
	NewAnonymousSessionRecord,
	AnonymousSessionService,
} from "../../src/application/sessions";

class TestAnonymousSessionRepository implements AnonymousSessionRepository {
	private readonly records = new Map<string, AnonymousSessionRecord & { tokenHash: string; revokedAt?: Date }>();

	public async create(record: NewAnonymousSessionRecord): Promise<AnonymousSessionRecord> {
		const created = { ...record, id: randomUUID() };
		this.records.set(created.id, created);
		return created;
	}

	public async findActiveByTokenHash(tokenHash: string, now: Date): Promise<AnonymousSessionRecord | null> {
		return [...this.records.values()].find((record) =>
			record.tokenHash === tokenHash && !record.revokedAt && record.expiresAt > now,
		) ?? null;
	}

	public async revokeById(id: string, revokedAt: Date): Promise<void> {
		const record = this.records.get(id);
		if (record && !record.revokedAt) this.records.set(id, { ...record, revokedAt });
	}
}

export async function createTestApplication(configure?: (application: Express) => void): Promise<Express> {
	await connectPrisma();
	process.env.NODE_ENV = "development";
	const configuration = loadConfiguration();
	const logger = initialiseLogging();
	const sessionService = new AnonymousSessionService(
		new TestAnonymousSessionRepository(),
		configuration.security.anonymousSessionLifetimeSeconds,
	);
	return createExpressApplication(configuration, logger, configure, sessionService);
}

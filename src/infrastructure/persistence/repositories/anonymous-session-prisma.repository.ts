import { PrismaClient } from "@prisma/client";

import {
	AnonymousSessionRecord,
	AnonymousSessionRepository,
	NewAnonymousSessionRecord,
} from "../../../application/sessions";
import { getPrismaClient } from "../../../bootstrap/prisma";

export class AnonymousSessionPrismaRepository implements AnonymousSessionRepository {
	public constructor(private readonly prisma: PrismaClient = getPrismaClient()) {}

	public async create(record: NewAnonymousSessionRecord): Promise<AnonymousSessionRecord> {
		const created = await this.prisma.anonymousSession.create({
			data: record,
			select: { id: true, csrfToken: true, createdAt: true, expiresAt: true },
		});
		return created;
	}

	public async findActiveByTokenHash(tokenHash: string, now: Date): Promise<AnonymousSessionRecord | null> {
		return this.prisma.anonymousSession.findFirst({
			where: { tokenHash, revokedAt: null, expiresAt: { gt: now } },
			select: { id: true, csrfToken: true, createdAt: true, expiresAt: true },
		});
	}

	public async revokeById(id: string, revokedAt: Date): Promise<void> {
		await this.prisma.anonymousSession.updateMany({
			where: { id, revokedAt: null },
			data: { revokedAt },
		});
	}
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonymousSessionPrismaRepository = void 0;
const prisma_1 = require("../../../bootstrap/prisma");
class AnonymousSessionPrismaRepository {
    constructor(prisma = (0, prisma_1.getPrismaClient)()) {
        this.prisma = prisma;
    }
    async create(record) {
        const created = await this.prisma.anonymousSession.create({
            data: record,
            select: { id: true, csrfToken: true, createdAt: true, expiresAt: true },
        });
        return created;
    }
    async findActiveByTokenHash(tokenHash, now) {
        return this.prisma.anonymousSession.findFirst({
            where: { tokenHash, revokedAt: null, expiresAt: { gt: now } },
            select: { id: true, csrfToken: true, createdAt: true, expiresAt: true },
        });
    }
    async revokeById(id, revokedAt) {
        await this.prisma.anonymousSession.updateMany({
            where: { id, revokedAt: null },
            data: { revokedAt },
        });
    }
}
exports.AnonymousSessionPrismaRepository = AnonymousSessionPrismaRepository;
//# sourceMappingURL=anonymous-session-prisma.repository.js.map
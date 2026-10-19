import { PrismaClient } from "@prisma/client";
import { AnonymousSessionRecord, AnonymousSessionRepository, NewAnonymousSessionRecord } from "../../../application/sessions";
export declare class AnonymousSessionPrismaRepository implements AnonymousSessionRepository {
    private readonly prisma;
    constructor(prisma?: PrismaClient);
    create(record: NewAnonymousSessionRecord): Promise<AnonymousSessionRecord>;
    findActiveByTokenHash(tokenHash: string, now: Date): Promise<AnonymousSessionRecord | null>;
    revokeById(id: string, revokedAt: Date): Promise<void>;
}
//# sourceMappingURL=anonymous-session-prisma.repository.d.ts.map
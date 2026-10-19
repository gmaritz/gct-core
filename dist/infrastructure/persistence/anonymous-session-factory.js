"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAnonymousSessionService = createAnonymousSessionService;
const sessions_1 = require("../../application/sessions");
const anonymous_session_prisma_repository_1 = require("./repositories/anonymous-session-prisma.repository");
function createAnonymousSessionService(configuration) {
    return new sessions_1.AnonymousSessionService(new anonymous_session_prisma_repository_1.AnonymousSessionPrismaRepository(), configuration.security.anonymousSessionLifetimeSeconds);
}
//# sourceMappingURL=anonymous-session-factory.js.map
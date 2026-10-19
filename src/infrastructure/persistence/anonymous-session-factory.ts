import { AnonymousSessionService } from "../../application/sessions";
import { ApplicationConfiguration } from "../../config/configuration.service";
import { AnonymousSessionPrismaRepository } from "./repositories/anonymous-session-prisma.repository";

export function createAnonymousSessionService(configuration: ApplicationConfiguration): AnonymousSessionService {
	return new AnonymousSessionService(
		new AnonymousSessionPrismaRepository(),
		configuration.security.anonymousSessionLifetimeSeconds,
	);
}

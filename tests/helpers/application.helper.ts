import { Express } from "express";

import { createExpressApplication } from "../../src/bootstrap/express";
import { initialiseLogging } from "../../src/bootstrap/logging";
import { connectPrisma } from "../../src/bootstrap/prisma";
import { loadConfiguration } from "../../src/config/configuration.service";

export async function createTestApplication(configure?: (application: Express) => void): Promise<Express> {
	await connectPrisma();
	const configuration = loadConfiguration();
	const logger = initialiseLogging();
	return createExpressApplication(configuration, logger, configure);
}

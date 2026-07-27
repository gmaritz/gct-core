import { Server } from "http";

import { AppConfiguration, loadConfiguration } from "./configuration";
import { initialiseLogging, Logger } from "./logging";
import { registerLifecycleHandlers } from "./lifecycle";
import { connectPrisma } from "./prisma";
import { createExpressApplication } from "./express";
import { PlatformInfoService } from "../application/platform";

function formatEnvironmentLabel(environment: AppConfiguration["nodeEnv"]): string {
	return `${environment.charAt(0).toUpperCase()}${environment.slice(1)}`;
}

export async function bootstrapApplication(): Promise<void> {
	const startupStartedAt = process.hrtime.bigint();
	const configuration = loadConfiguration();
	const logger = initialiseLogging();
	const platformInfoService = new PlatformInfoService();

	logger.info("Startup initiated", {
		...platformInfoService.getPlatformInfo(),
		environmentLabel: formatEnvironmentLabel(configuration.nodeEnv),
		nodeVersion: process.version,
		port: configuration.port,
		startupTimestamp: platformInfoService.getStartupInfo(configuration.port, 0).startupTimestamp,
	});
	logger.info("[OK] Configuration Loaded");
	logger.info("[OK] Logger Initialised");

	await connectPrisma();
	logger.info("[OK] Prisma Connected");

	const expressApplication = createExpressApplication(configuration, logger);
	logger.info("[OK] Express Configured");

	const httpServer = await startHttpServer(expressApplication, configuration.port);
	logger.info("[OK] HTTP Server Listening");

	registerLifecycleHandlers(logger as Logger, {
		beforeShutdown: async () => {
			await stopHttpServer(httpServer);
			logger.info("HTTP server stopped");
		},
	});
	const startupDurationMs = Number(process.hrtime.bigint() - startupStartedAt) / 1_000_000;
	const startupInfo = platformInfoService.getStartupInfo(configuration.port, Number(startupDurationMs.toFixed(2)));
	logger.info("[OK] Lifecycle Registered");
	logger.info("Platform Ready", startupInfo);
	logger.info("Listening", { address: `http://localhost:${configuration.port}` });
}

function startHttpServer(expressApplication: ReturnType<typeof createExpressApplication>, port: number): Promise<Server> {
	return new Promise((resolve, reject) => {
		const server = expressApplication.listen(port, () => {
			resolve(server);
		});

		server.on("error", (error) => {
			reject(error);
		});
	});
}

function stopHttpServer(server: Server): Promise<void> {
	return new Promise((resolve, reject) => {
		server.close((error) => {
			if (error) {
				reject(error);
				return;
			}

			resolve();
		});
	});
}

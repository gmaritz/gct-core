import { Server } from "http";

import { AppConfiguration, loadConfiguration } from "./configuration";
import { initialiseLogging, Logger } from "./logging";
import { registerLifecycleHandlers } from "./lifecycle";
import { connectPrisma } from "./prisma";
import { createExpressApplication } from "./express";

function formatEnvironmentLabel(environment: AppConfiguration["nodeEnv"]): string {
	return `${environment.charAt(0).toUpperCase()}${environment.slice(1)}`;
}

export async function bootstrapApplication(): Promise<void> {
	const configuration = loadConfiguration();
	const logger = initialiseLogging();

	logger.info("==================================================");
	logger.info("Go Cape Tours Core Platform");
	logger.info(`Environment : ${formatEnvironmentLabel(configuration.nodeEnv)}`);
	logger.info("[OK] Configuration Loaded");
	logger.info("[OK] Logger Initialised");

	await connectPrisma();
	logger.info("[OK] Prisma Connected");

	const expressApplication = createExpressApplication(configuration);
	logger.info("[OK] Express Configured");

	const httpServer = await startHttpServer(expressApplication, configuration.port);
	logger.info("[OK] HTTP Server Listening");

	registerLifecycleHandlers(logger as Logger, {
		beforeShutdown: async () => {
			await stopHttpServer(httpServer);
			logger.info("HTTP server stopped");
		},
	});
	logger.info("[OK] Lifecycle Registered");
	logger.info("Platform Ready");
	logger.info(`Listening: http://localhost:${configuration.port}`);
	logger.info("==================================================");
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

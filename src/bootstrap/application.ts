import { AppConfiguration, loadConfiguration } from "./configuration";
import { initialiseLogging, Logger } from "./logging";
import { registerLifecycleHandlers } from "./lifecycle";
import { connectPrisma } from "./prisma";

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

	registerLifecycleHandlers(logger as Logger);
	logger.info("[OK] Lifecycle Registered");
	logger.info("Platform Bootstrap Complete");
	logger.info("==================================================");
}

import { flushLogger, Logger } from "./logging";
import { disconnectPrisma } from "./prisma";

let handlersRegistered = false;
let shuttingDown = false;

async function handleShutdown(signal: NodeJS.Signals, logger: Logger): Promise<void> {
	if (shuttingDown) {
		return;
	}

	shuttingDown = true;

	try {
		logger.info(`Shutdown signal received: ${signal}`);
		logger.info("Starting graceful shutdown...");
		await disconnectPrisma();
		logger.info("Prisma disconnected");
		await flushLogger();
		if (!process.stdin.destroyed) {
			process.stdin.pause();
		}
		process.exit(0);
	} catch (error) {
		logger.error("Shutdown failed", error);
		process.exit(1);
	}
}

export function registerLifecycleHandlers(logger: Logger): void {
	if (handlersRegistered) {
		return;
	}

	process.on("SIGINT", () => {
		void handleShutdown("SIGINT", logger);
	});

	process.on("SIGTERM", () => {
		void handleShutdown("SIGTERM", logger);
	});

	if (!process.stdin.destroyed) {
		process.stdin.resume();
	}

	handlersRegistered = true;
}

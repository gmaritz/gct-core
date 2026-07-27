import { flushLogger, Logger } from "./logging";
import { disconnectPrisma } from "./prisma";

let handlersRegistered = false;
let shuttingDown = false;

export interface LifecycleHooks {
	beforeShutdown?: () => Promise<void>;
}

async function handleShutdown(signal: NodeJS.Signals, logger: Logger, hooks?: LifecycleHooks): Promise<void> {
	if (shuttingDown) {
		return;
	}

	shuttingDown = true;

	try {
		logger.info(`Shutdown signal received: ${signal}`);
		logger.info("Starting graceful shutdown...");
		if (hooks?.beforeShutdown) {
			await hooks.beforeShutdown();
		}
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

export function registerLifecycleHandlers(logger: Logger, hooks?: LifecycleHooks): void {
	if (handlersRegistered) {
		return;
	}

	process.on("SIGINT", () => {
		void handleShutdown("SIGINT", logger, hooks);
	});

	process.on("SIGTERM", () => {
		void handleShutdown("SIGTERM", logger, hooks);
	});

	if (!process.stdin.destroyed) {
		process.stdin.resume();
	}

	handlersRegistered = true;
}

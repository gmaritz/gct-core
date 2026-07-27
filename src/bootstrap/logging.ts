export interface Logger {
	info(message: string, ...meta: unknown[]): void;
	warn(message: string, ...meta: unknown[]): void;
	error(message: string, ...meta: unknown[]): void;
}

class ConsoleLogger implements Logger {
	info(message: string, ...meta: unknown[]): void {
		console.info(`[INFO] ${message}`, ...meta);
	}

	warn(message: string, ...meta: unknown[]): void {
		console.warn(`[WARN] ${message}`, ...meta);
	}

	error(message: string, ...meta: unknown[]): void {
		console.error(`[ERROR] ${message}`, ...meta);
	}
}

const logger: Logger = new ConsoleLogger();

export function initialiseLogging(): Logger {
	return logger;
}

export function getLogger(): Logger {
	return logger;
}

export async function flushLogger(): Promise<void> {
	return Promise.resolve();
}

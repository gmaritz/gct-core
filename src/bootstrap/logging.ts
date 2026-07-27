import { PLATFORM_METADATA } from "../shared/metadata";

export interface Logger {
	info(message: string, ...meta: unknown[]): void;
	warn(message: string, ...meta: unknown[]): void;
	error(message: string, ...meta: unknown[]): void;
}

interface LogEntry {
	timestamp: string;
	level: "INFO" | "WARN" | "ERROR";
	service: string;
	requestId: string | null;
	message: string;
	fields?: Record<string, unknown>;
	meta?: unknown[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function extractLogData(meta: unknown[]): {
	requestId: string | null;
	fields?: Record<string, unknown>;
	rest?: unknown[];
} {
	let requestId: string | null = null;
	const fieldCollection: Record<string, unknown> = {};
	const rest: unknown[] = [];

	for (const item of meta) {
		if (isRecord(item)) {
			for (const [key, value] of Object.entries(item)) {
				fieldCollection[key] = value;
			}

			if (requestId === null && typeof item.requestId === "string" && item.requestId.trim().length > 0) {
				requestId = item.requestId;
			}
			continue;
		}

		rest.push(item);
	}

	return {
		requestId,
		fields: Object.keys(fieldCollection).length > 0 ? fieldCollection : undefined,
		rest: rest.length > 0 ? rest : undefined,
	};
}

class ConsoleLogger implements Logger {
	private write(level: LogEntry["level"], message: string, ...meta: unknown[]): void {
		const extracted = extractLogData(meta);
		const entry: LogEntry = {
			timestamp: new Date().toISOString(),
			level,
			service: PLATFORM_METADATA.SERVICE_NAME,
			requestId: extracted.requestId,
			message,
			fields: extracted.fields,
			meta: extracted.rest,
		};

		const serialisedEntry = JSON.stringify(entry);
		if (level === "ERROR") {
			console.error(serialisedEntry);
			return;
		}

		if (level === "WARN") {
			console.warn(serialisedEntry);
			return;
		}

		console.info(serialisedEntry);
	}

	info(message: string, ...meta: unknown[]): void {
		this.write("INFO", message, ...meta);
	}

	warn(message: string, ...meta: unknown[]): void {
		this.write("WARN", message, ...meta);
	}

	error(message: string, ...meta: unknown[]): void {
		this.write("ERROR", message, ...meta);
	}
}

const logger: Logger = new ConsoleLogger();

export function initialiseLogging(): Logger {
	return logger;
}

export function getLogger(): Logger {
	return logger;
}

export function withRequestContext(loggerInstance: Logger, requestId: string): Logger {
	return {
		info(message: string, ...meta: unknown[]): void {
			loggerInstance.info(message, { requestId }, ...meta);
		},
		warn(message: string, ...meta: unknown[]): void {
			loggerInstance.warn(message, { requestId }, ...meta);
		},
		error(message: string, ...meta: unknown[]): void {
			loggerInstance.error(message, { requestId }, ...meta);
		},
	};
}

export async function flushLogger(): Promise<void> {
	return Promise.resolve();
}

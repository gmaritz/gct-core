import fs from "fs";
import path from "path";

export type NodeEnvironment = "development" | "test" | "production";

export interface AppConfiguration {
	nodeEnv: NodeEnvironment;
	port: number;
	databaseUrl: string;
}

function parseEnvValue(rawValue: string): string {
	const value = rawValue.trim();
	if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
		return value.slice(1, -1);
	}
	return value;
}

function loadEnvironmentFile(filePath: string): void {
	if (!fs.existsSync(filePath)) {
		return;
	}

	const contents = fs.readFileSync(filePath, "utf8");
	const lines = contents.split(/\r?\n/);

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) {
			continue;
		}

		const separatorIndex = trimmed.indexOf("=");
		if (separatorIndex <= 0) {
			continue;
		}

		const key = trimmed.slice(0, separatorIndex).trim();
		const value = parseEnvValue(trimmed.slice(separatorIndex + 1));

		if (!process.env[key]) {
			process.env[key] = value;
		}
	}
}

function parsePort(rawPort: string | undefined): number {
	if (!rawPort) {
		return 3000;
	}

	const port = Number.parseInt(rawPort, 10);
	if (Number.isNaN(port) || port <= 0 || port > 65535) {
		throw new Error(`Invalid PORT value: ${rawPort}`);
	}

	return port;
}

function parseNodeEnv(rawNodeEnv: string | undefined): NodeEnvironment {
	const fallback = "development";
	const candidate = (rawNodeEnv ?? fallback).toLowerCase();

	if (candidate === "development" || candidate === "test" || candidate === "production") {
		return candidate;
	}

	throw new Error(`Invalid NODE_ENV value: ${rawNodeEnv}`);
}

export function loadConfiguration(): AppConfiguration {
	const envPath = path.resolve(process.cwd(), ".env");
	loadEnvironmentFile(envPath);

	const nodeEnv = parseNodeEnv(process.env.NODE_ENV);
	const port = parsePort(process.env.PORT);
	const databaseUrl = process.env.DATABASE_URL;

	if (!databaseUrl) {
		throw new Error("Missing required configuration: DATABASE_URL");
	}

	return {
		nodeEnv,
		port,
		databaseUrl,
	};
}

import { PLATFORM_METADATA } from "../../shared/metadata";

export interface PlatformInfo {
	service: string;
	name: string;
	version: string;
	environment: string;
}

export interface VersionInfo {
	service: string;
	version: string;
	environment: string;
	build: string;
	timestamp: string;
}

export interface StartupInfo {
	service: string;
	name: string;
	version: string;
	build: string;
	environment: string;
	nodeVersion: string;
	port: number;
	startupTimestamp: string;
	startupDurationMs: number;
}

export class PlatformInfoService {
	getPlatformInfo(): PlatformInfo {
		return {
			service: PLATFORM_METADATA.SERVICE_NAME,
			name: PLATFORM_METADATA.PLATFORM_NAME,
			version: PLATFORM_METADATA.VERSION,
			environment: PLATFORM_METADATA.NODE_ENV,
		};
	}

	getVersionInfo(): VersionInfo {
		return {
			service: PLATFORM_METADATA.SERVICE_NAME,
			version: PLATFORM_METADATA.VERSION,
			environment: PLATFORM_METADATA.NODE_ENV,
			build: PLATFORM_METADATA.BUILD,
			timestamp: new Date().toISOString(),
		};
	}

	getStartupInfo(port: number, startupDurationMs: number): StartupInfo {
		return {
			service: PLATFORM_METADATA.SERVICE_NAME,
			name: PLATFORM_METADATA.PLATFORM_NAME,
			version: PLATFORM_METADATA.VERSION,
			build: PLATFORM_METADATA.BUILD,
			environment: PLATFORM_METADATA.NODE_ENV,
			nodeVersion: process.version,
			port,
			startupTimestamp: PLATFORM_METADATA.START_TIME,
			startupDurationMs,
		};
	}

	getUptime(): number {
		const startedAtMs = Date.parse(PLATFORM_METADATA.START_TIME);
		const uptimeMs = Date.now() - startedAtMs;
		return Math.max(0, Math.floor(uptimeMs / 1000));
	}
}

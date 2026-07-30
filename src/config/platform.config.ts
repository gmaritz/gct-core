export interface PlatformConfig {
	serviceName: string;
	platformName: string;
	version: string;
	build: string;
	environment: string;
}

export function createPlatformConfig(version: string, build: string, environment: string): PlatformConfig {
	return {
		serviceName: "gct-core",
		platformName: "Go Cape Tours Core Platform",
		version,
		build,
		environment,
	};
}

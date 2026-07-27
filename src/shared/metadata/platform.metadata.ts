const DEFAULT_VERSION = "1.0.0";
const DEFAULT_BUILD = "development";

export const PLATFORM_METADATA = {
	SERVICE_NAME: "gct-core",
	PLATFORM_NAME: "Go Cape Tours Core Platform",
	VERSION: process.env.npm_package_version ?? DEFAULT_VERSION,
	BUILD: process.env.BUILD_VERSION ?? DEFAULT_BUILD,
	NODE_ENV: process.env.NODE_ENV ?? "development",
	START_TIME: new Date().toISOString(),
} as const;

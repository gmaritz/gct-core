import { loadConfiguration as loadGroupedConfiguration } from "../config/configuration.service";

export type NodeEnvironment = "development" | "test" | "production";

export interface AppConfiguration {
	nodeEnv: NodeEnvironment;
	port: number;
	databaseUrl: string;
}

export function loadConfiguration(): AppConfiguration {
	const configuration = loadGroupedConfiguration();

	return {
		nodeEnv: configuration.platform.environment as NodeEnvironment,
		port: configuration.server.port,
		databaseUrl: configuration.database.url,
	};
}

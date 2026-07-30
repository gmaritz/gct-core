import { createDatabaseConfig, DatabaseConfig } from "./database.config";
import { createLoggingConfig, LoggingConfig } from "./logging.config";
import { createPlatformConfig, PlatformConfig } from "./platform.config";
import { createSecurityConfig, SecurityConfig } from "./security.config";
import { createServerConfig, ServerConfig } from "./server.config";

export interface ApplicationConfiguration {
	platform: PlatformConfig;
	server: ServerConfig;
	database: DatabaseConfig;
	logging: LoggingConfig;
	security: SecurityConfig;
}

export class ConfigurationService {
	private readonly configuration: ApplicationConfiguration;

	constructor() {
		this.configuration = this.createConfiguration();
	}

	public getConfiguration(): ApplicationConfiguration {
		return this.configuration;
	}

	private createConfiguration(): ApplicationConfiguration {
		const nodeEnv = process.env.NODE_ENV ?? "development";
		const port = this.parsePort(process.env.PORT ?? "3000");
		const databaseUrl = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/gct_core";
		const loggingLevel = process.env.LOG_LEVEL ?? "info";
		const corsEnabled = this.parseBoolean(process.env.CORS_ENABLED ?? "true");

		return {
			platform: createPlatformConfig("0.1.0", "local", nodeEnv),
			database: createDatabaseConfig(databaseUrl),
			logging: createLoggingConfig(loggingLevel),
			security: createSecurityConfig(corsEnabled),
			server: createServerConfig(port, corsEnabled),
		};
	}

	private parsePort(value: string): number {
		const parsed = Number.parseInt(value, 10);
		if (Number.isNaN(parsed) || parsed < 1 || parsed > 65535) {
			return 3000;
		}

		return parsed;
	}

	private parseBoolean(value: string): boolean {
		return value === "true";
	}
}

export function loadConfiguration(): ApplicationConfiguration {
	return new ConfigurationService().getConfiguration();
}

import { createDatabaseConfig, DatabaseConfig } from "./database.config";
import { createLoggingConfig, LoggingConfig } from "./logging.config";
import { createPlatformConfig, PlatformConfig } from "./platform.config";
import { createSecurityConfig, SecurityConfig } from "./security.config";
import { createServerConfig, ServerConfig } from "./server.config";
import { loadAccommodationFulfilmentMode } from "./accommodation-fulfilment.config";
import { AccommodationFulfilmentMode } from "../application/reservations/service/accommodation-fulfilment-mode";
import { DevelopmentIngressConfig, loadDevelopmentIngressConfig } from "./development-ingress.config";
import { isIP } from "net";

export interface ApplicationConfiguration {
	platform: PlatformConfig;
	server: ServerConfig;
	database: DatabaseConfig;
	logging: LoggingConfig;
	security: SecurityConfig;
	accommodationFulfilmentMode: AccommodationFulfilmentMode;
	developmentIngress?: DevelopmentIngressConfig;
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
		const developmentIngress = loadDevelopmentIngressConfig(process.env, nodeEnv);
		const trustedProxy = this.parseTrustedProxy(process.env.GCT_TRUST_PROXY, Boolean(developmentIngress));
		const port = this.parsePort(process.env.PORT ?? "3000");
		const databaseUrl = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/gct_core";
		const loggingLevel = process.env.LOG_LEVEL ?? "info";
		const corsEnabled = this.parseBoolean(process.env.CORS_ENABLED ?? "true");
		const anonymousSessionLifetimeSeconds = this.parseBoundedInteger(
			process.env.ANONYMOUS_SESSION_TTL_SECONDS ?? "43200",
			"ANONYMOUS_SESSION_TTL_SECONDS",
			300,
			604800,
		);

		return {
			platform: createPlatformConfig("0.1.0", "local", nodeEnv),
			database: createDatabaseConfig(databaseUrl),
			logging: createLoggingConfig(loggingLevel),
			security: createSecurityConfig(corsEnabled, nodeEnv, anonymousSessionLifetimeSeconds, trustedProxy, Boolean(developmentIngress)),
			server: createServerConfig(port, corsEnabled),
			developmentIngress,
			accommodationFulfilmentMode: loadAccommodationFulfilmentMode({
				...process.env,
				NODE_ENV: nodeEnv,
			}),
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

	private parseTrustedProxy(value: string | undefined, ingressEnabled: boolean): boolean | string {
		if (ingressEnabled) {
			if (value !== undefined && value !== "false") {
				throw new Error("GCT_TRUST_PROXY must be false in development ingress mode.");
			}
			return false;
		}
		if (value === undefined || value === "true") return true;
		if (value === "false") return false;
		if (isIP(value)) return value;
		throw new Error("GCT_TRUST_PROXY must be true, false, or one exact IP address.");
	}

	private parseBoundedInteger(value: string, name: string, minimum: number, maximum: number): number {
		const parsed = Number(value);
		if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
			throw new Error(`${name} must be an integer between ${minimum} and ${maximum}.`);
		}
		return parsed;
	}
}

export function loadConfiguration(): ApplicationConfiguration {
	return new ConfigurationService().getConfiguration();
}

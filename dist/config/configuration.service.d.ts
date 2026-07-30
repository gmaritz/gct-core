import { DatabaseConfig } from "./database.config";
import { LoggingConfig } from "./logging.config";
import { PlatformConfig } from "./platform.config";
import { SecurityConfig } from "./security.config";
import { ServerConfig } from "./server.config";
export interface ApplicationConfiguration {
    platform: PlatformConfig;
    server: ServerConfig;
    database: DatabaseConfig;
    logging: LoggingConfig;
    security: SecurityConfig;
}
export declare class ConfigurationService {
    private readonly configuration;
    constructor();
    getConfiguration(): ApplicationConfiguration;
    private createConfiguration;
    private parsePort;
    private parseBoolean;
}
export declare function loadConfiguration(): ApplicationConfiguration;
//# sourceMappingURL=configuration.service.d.ts.map
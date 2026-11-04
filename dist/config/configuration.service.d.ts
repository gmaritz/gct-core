import { DatabaseConfig } from "./database.config";
import { LoggingConfig } from "./logging.config";
import { PlatformConfig } from "./platform.config";
import { SecurityConfig } from "./security.config";
import { ServerConfig } from "./server.config";
import { AccommodationFulfilmentMode } from "../application/reservations/service/accommodation-fulfilment-mode";
export interface ApplicationConfiguration {
    platform: PlatformConfig;
    server: ServerConfig;
    database: DatabaseConfig;
    logging: LoggingConfig;
    security: SecurityConfig;
    accommodationFulfilmentMode: AccommodationFulfilmentMode;
}
export declare class ConfigurationService {
    private readonly configuration;
    constructor();
    getConfiguration(): ApplicationConfiguration;
    private createConfiguration;
    private parsePort;
    private parseBoolean;
    private parseBoundedInteger;
}
export declare function loadConfiguration(): ApplicationConfiguration;
//# sourceMappingURL=configuration.service.d.ts.map
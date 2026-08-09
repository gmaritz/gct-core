export declare enum HotelbedsEnvironment {
    TEST = "TEST",
    PRODUCTION = "PRODUCTION"
}
export interface HotelbedsIntegrationConfig {
    readonly environment: HotelbedsEnvironment;
    readonly apiKey: string;
    readonly secret: string;
    readonly baseUrl: string;
    readonly timeoutMs: number;
}
export declare class HotelbedsConfigurationError extends Error {
    readonly code = "CONFIGURATION_ERROR";
    constructor(message: string);
}
export declare function createHotelbedsIntegrationConfig(input: HotelbedsIntegrationConfig): HotelbedsIntegrationConfig;
export declare function loadHotelbedsIntegrationConfig(env?: NodeJS.ProcessEnv): HotelbedsIntegrationConfig;
//# sourceMappingURL=hotelbeds-integration-config.d.ts.map
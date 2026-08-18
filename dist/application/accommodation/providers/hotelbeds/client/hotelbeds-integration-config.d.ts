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
    readonly selectedHotelCodes?: ReadonlyArray<string>;
    readonly contentBatchSize?: number;
    readonly contentMaxQps?: number;
    readonly contentMaxRetries?: number;
    readonly contentRetryBaseDelayMs?: number;
}
export declare class HotelbedsConfigurationError extends Error {
    readonly code = "CONFIGURATION_ERROR";
    constructor(message: string);
}
export declare const DEFAULT_CONTENT_BATCH_SIZE = 50;
export declare const DEFAULT_CONTENT_MAX_QPS = 1;
export declare const DEFAULT_CONTENT_MAX_RETRIES = 3;
export declare const DEFAULT_CONTENT_RETRY_BASE_DELAY_MS = 1000;
export declare function createHotelbedsIntegrationConfig(input: HotelbedsIntegrationConfig): HotelbedsIntegrationConfig;
export declare function loadHotelbedsIntegrationConfig(env?: NodeJS.ProcessEnv): HotelbedsIntegrationConfig;
//# sourceMappingURL=hotelbeds-integration-config.d.ts.map
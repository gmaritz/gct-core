import { HotelbedsAuthentication } from "./hotelbeds-authentication";
import { HotelbedsAvailabilityRequest } from "./hotelbeds-availability-request";
import { HotelbedsAvailabilityExecutionResult } from "./hotelbeds-availability-execution-result";
import { HotelbedsIntegrationConfig } from "./hotelbeds-integration-config";
import { HotelbedsTransport } from "./hotelbeds-transport";
export interface HotelbedsAvailabilityExecutor {
    execute(requests: ReadonlyArray<HotelbedsAvailabilityRequest>): Promise<HotelbedsAvailabilityExecutionResult>;
}
export interface HotelbedsSupplierProtectionSettings {
    readonly maxQps: number;
    readonly maxConcurrency: number;
    readonly now: () => number;
    readonly sleep: (delayMs: number) => Promise<void>;
}
interface HotelbedsAvailabilityExecutorOptions {
    readonly maxAttempts: number;
    readonly maxQps: number;
    readonly maxConcurrency: number;
    readonly now: () => number;
    readonly sleep: (delayMs: number) => Promise<void>;
}
export declare class DefaultHotelbedsAvailabilityExecutor implements HotelbedsAvailabilityExecutor {
    private readonly configLoader;
    private readonly authentication;
    private readonly transport;
    private readonly options;
    constructor(configLoader?: () => HotelbedsIntegrationConfig, authentication?: HotelbedsAuthentication, transport?: HotelbedsTransport, options?: Partial<HotelbedsAvailabilityExecutorOptions>);
    execute(requests: ReadonlyArray<HotelbedsAvailabilityRequest>): Promise<HotelbedsAvailabilityExecutionResult>;
    private executeRequestWithRetry;
}
export {};
//# sourceMappingURL=hotelbeds-availability-executor.d.ts.map
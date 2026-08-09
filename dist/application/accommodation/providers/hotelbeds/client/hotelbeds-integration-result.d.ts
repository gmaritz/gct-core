import { HotelbedsIntegrationError } from "./hotelbeds-integration-error";
export interface HotelbedsProviderResponseSummary {
    readonly status: number;
    readonly payloadType: "object" | "array" | "none";
}
export interface HotelbedsIntegrationResultMetadata {
    readonly completedAt: Date;
    readonly requestId?: string;
    readonly correlationId?: string;
    readonly durationMs?: number;
}
export interface HotelbedsIntegrationResult<T> {
    readonly success: boolean;
    readonly operation: string;
    readonly provider: "hotelbeds";
    readonly retryable: boolean;
    readonly data: T | null;
    readonly errors: ReadonlyArray<HotelbedsIntegrationError>;
    readonly providerResponse?: HotelbedsProviderResponseSummary;
    readonly metadata: HotelbedsIntegrationResultMetadata;
}
export declare function createHotelbedsIntegrationResult<T>(result: HotelbedsIntegrationResult<T>): HotelbedsIntegrationResult<T>;
//# sourceMappingURL=hotelbeds-integration-result.d.ts.map
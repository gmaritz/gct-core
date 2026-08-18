import { HotelbedsIntegrationError } from "./hotelbeds-integration-error";
import { HotelbedsAvailabilityRequest } from "./hotelbeds-availability-request";
export interface HotelbedsAvailabilitySupplierError {
    readonly code?: string;
    readonly message?: string;
    readonly payload: unknown;
}
export interface HotelbedsAvailabilityTransportFailure {
    readonly kind: string;
    readonly message: string;
    readonly providerCode?: string;
}
export interface HotelbedsAvailabilityRawResponse {
    readonly requestIndex: number;
    readonly request: HotelbedsAvailabilityRequest;
    readonly success: boolean;
    readonly retryable: boolean;
    readonly attempts: number;
    readonly httpStatus?: number;
    readonly headers?: Readonly<Record<string, string>>;
    readonly body?: unknown;
    readonly supplierError?: HotelbedsAvailabilitySupplierError;
    readonly transportFailure?: HotelbedsAvailabilityTransportFailure;
    readonly errors: ReadonlyArray<HotelbedsIntegrationError>;
}
export interface HotelbedsAvailabilityExecutionResult {
    readonly provider: "hotelbeds";
    readonly operation: "availability";
    readonly completedAt: Date;
    readonly responses: ReadonlyArray<HotelbedsAvailabilityRawResponse>;
}
export declare function createHotelbedsAvailabilityExecutionResult(result: HotelbedsAvailabilityExecutionResult): HotelbedsAvailabilityExecutionResult;
//# sourceMappingURL=hotelbeds-availability-execution-result.d.ts.map
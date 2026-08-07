import { ReservationStatus } from "../../aggregate";
export interface BookingIntegrationResultMetadata {
    readonly generatedAt: Date;
    readonly version: string;
    readonly requestId: string;
    readonly correlationId: string;
    readonly operation: string;
}
export interface BookingIntegrationResult {
    readonly successful: boolean;
    readonly providerIdentifier: string;
    readonly providerBookingReference: string | null;
    readonly reservationStatus: ReservationStatus;
    readonly errors: ReadonlyArray<string>;
    readonly warnings: ReadonlyArray<string>;
    readonly metadata: BookingIntegrationResultMetadata;
}
export declare function createBookingIntegrationResult(input: {
    readonly successful: boolean;
    readonly providerIdentifier: string;
    readonly providerBookingReference?: string | null;
    readonly reservationStatus: ReservationStatus;
    readonly errors?: ReadonlyArray<string>;
    readonly warnings?: ReadonlyArray<string>;
    readonly metadata: BookingIntegrationResultMetadata;
}): BookingIntegrationResult;
//# sourceMappingURL=booking-integration-result.d.ts.map
import { Accommodation } from "../../models";
export type AccommodationCancellationStatus = "CANCELLED" | "FAILED" | "UNKNOWN" | "ALREADY_CANCELLED";
export interface AccommodationCancellationRequest {
    readonly reservationId: string;
    readonly provider: string;
    readonly supplierBookingReference: string;
    readonly reservationStatus: "CONFIRMED" | "CANCELLED";
    readonly accommodation?: Accommodation;
    readonly packageStopId?: string;
    readonly idempotencyKey: string;
}
export interface AccommodationCancellationCharge {
    readonly amount: number;
    readonly currency: string;
    readonly effectiveAt?: Date;
    readonly description?: string;
}
export interface AccommodationCancellationResult {
    readonly successful: boolean;
    readonly status: AccommodationCancellationStatus;
    readonly reservationId: string;
    readonly provider: string;
    readonly supplierBookingReference: string;
    readonly charge?: AccommodationCancellationCharge;
    readonly cancelledAt?: Date;
    readonly packageStopId?: string;
    readonly errors: ReadonlyArray<{
        readonly code: string;
        readonly message: string;
    }>;
    readonly warnings: ReadonlyArray<string>;
}
//# sourceMappingURL=accommodation-cancellation.d.ts.map
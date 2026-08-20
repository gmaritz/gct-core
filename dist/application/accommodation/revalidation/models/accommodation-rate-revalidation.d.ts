import { AccommodationAvailabilityOccupancy, AccommodationRateOption, AccommodationRoomOption, AccommodationSupplierReference } from "../../results";
import { Accommodation } from "../../models";
export interface AccommodationRateRevalidationRequest {
    readonly accommodation: Accommodation;
    readonly room: AccommodationRoomOption;
    readonly rate: AccommodationRateOption;
    readonly providerReference: AccommodationSupplierReference;
    readonly stayPeriod: {
        readonly checkIn: Date;
        readonly checkOut: Date;
    };
    readonly occupancy: AccommodationAvailabilityOccupancy;
    readonly packageStopId?: string;
}
export type AccommodationRateRevalidationStatus = "VALID" | "CHANGED" | "UNAVAILABLE" | "FAILED";
export interface AccommodationRateRevalidationResult {
    readonly status: AccommodationRateRevalidationStatus;
    readonly accommodation: Accommodation;
    readonly room: AccommodationRoomOption;
    readonly previousRate: AccommodationRateOption;
    readonly currentRate?: AccommodationRateOption;
    readonly packageStopId?: string;
    readonly provider: string;
    readonly error?: {
        readonly code: string;
        readonly message: string;
    };
}
//# sourceMappingURL=accommodation-rate-revalidation.d.ts.map
import { Accommodation } from "../../models";
import { AccommodationAvailabilityOccupancy, AccommodationRateOption, AccommodationRoomOption } from "../../results";
import { AccommodationBookingGuest, AccommodationBookingHolder } from "../../booking";
export type AccommodationBookingDetailsStatus = "CONFIRMED" | "CANCELLED" | "MODIFIED" | "UNKNOWN" | "FAILED";
export interface AccommodationBookingDetailsRequest {
    readonly reservationId?: string;
    readonly provider: string;
    readonly supplierBookingReference: string;
    readonly packageStopId?: string;
}
export interface AccommodationBookingDetailsResult {
    readonly successful: boolean;
    readonly status: AccommodationBookingDetailsStatus;
    readonly reservationId?: string;
    readonly provider: string;
    readonly supplierBookingReference: string;
    readonly accommodation?: Accommodation;
    readonly rooms: ReadonlyArray<AccommodationRoomOption>;
    readonly rate?: AccommodationRateOption;
    readonly stayPeriod?: {
        readonly checkIn: Date;
        readonly checkOut: Date;
    };
    readonly occupancy?: AccommodationAvailabilityOccupancy;
    readonly guests?: ReadonlyArray<AccommodationBookingGuest>;
    readonly holder?: AccommodationBookingHolder;
    readonly supplierPrice?: {
        readonly amount: number;
        readonly currency: string;
    };
    readonly cancellable?: boolean;
    readonly modifiable?: boolean;
    readonly packageStopId?: string;
    readonly errors: ReadonlyArray<{
        readonly code: string;
        readonly message: string;
    }>;
    readonly warnings: ReadonlyArray<string>;
}
//# sourceMappingURL=accommodation-booking-details.d.ts.map
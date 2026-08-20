import { AccommodationBookingGuest, AccommodationBookingHolder } from "../../../booking";
import { AccommodationAvailabilityOccupancy, AccommodationRateOption, AccommodationRoomOption } from "../../../results";
import { Accommodation } from "../../../models";
export interface HotelbedsBookingDetailsMapping {
    readonly status: "CONFIRMED" | "CANCELLED" | "MODIFIED" | "UNKNOWN";
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
}
export declare function mapHotelbedsBookingDetails(payload: unknown): HotelbedsBookingDetailsMapping;
//# sourceMappingURL=booking-details.mapper.d.ts.map
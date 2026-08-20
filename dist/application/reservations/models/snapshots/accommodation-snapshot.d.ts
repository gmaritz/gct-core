import { ReservationSnapshot } from "./reservation-snapshot";
import { AccommodationAvailabilityOccupancy, AccommodationSupplierReference } from "../../../accommodation";
export interface AccommodationSnapshot extends ReservationSnapshot {
    readonly accommodationId: string;
    readonly propertyName: string;
    readonly roomType?: string;
    readonly mealBasis?: string;
    readonly checkInDate?: Date;
    readonly checkOutDate?: Date;
    readonly packageId?: string;
    readonly packageStopId?: string;
    readonly stopOrder?: number;
    readonly rateReference?: AccommodationSupplierReference;
    readonly roomReference?: AccommodationSupplierReference;
    readonly provider?: string;
    readonly occupancy?: AccommodationAvailabilityOccupancy;
    readonly supplierPrice?: {
        readonly amount: number;
        readonly currency: string;
        readonly basis?: string;
    };
}
//# sourceMappingURL=accommodation-snapshot.d.ts.map
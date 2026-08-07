import { ReservationSnapshot } from "./reservation-snapshot";
export interface AccommodationSnapshot extends ReservationSnapshot {
    readonly accommodationId: string;
    readonly propertyName: string;
    readonly roomType?: string;
    readonly mealBasis?: string;
    readonly checkInDate?: Date;
    readonly checkOutDate?: Date;
}
//# sourceMappingURL=accommodation-snapshot.d.ts.map
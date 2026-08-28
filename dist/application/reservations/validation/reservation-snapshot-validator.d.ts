import { AccommodationSnapshot, JourneySnapshot, PaymentSnapshot, PricingSnapshot, ReservationMetadata, SupplierReference, TravellerSnapshot, BookingItemSnapshot } from "../models";
import { ReservationValidationResult } from "./models";
export interface ReservationSnapshotSet {
    readonly journeySnapshot?: JourneySnapshot;
    readonly travellerSnapshots?: ReadonlyArray<TravellerSnapshot>;
    readonly accommodationSnapshots?: ReadonlyArray<AccommodationSnapshot>;
    readonly bookingItems?: ReadonlyArray<BookingItemSnapshot>;
    readonly pricingSnapshot?: PricingSnapshot;
    readonly paymentSnapshot?: PaymentSnapshot;
    readonly supplierReferences?: ReadonlyArray<SupplierReference>;
    readonly metadata?: ReservationMetadata;
}
export declare class ReservationSnapshotValidator {
    validate(snapshotSet: ReservationSnapshotSet | null | undefined): ReservationValidationResult;
}
//# sourceMappingURL=reservation-snapshot-validator.d.ts.map
import { AccommodationSnapshot, JourneySnapshot, PaymentSnapshot, PricingSnapshot, ReservationMetadata, ReservationTimeline, SupplierReference, TravellerSnapshot } from "../models";
export declare enum ReservationStatus {
    CREATED = "CREATED",
    QUOTED = "QUOTED",
    CONFIRMED = "CONFIRMED",
    AMENDED = "AMENDED",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED"
}
export interface ReservationIdentity {
    readonly id: string;
}
export interface ReservationComposition {
    readonly identity: ReservationIdentity;
    readonly status: ReservationStatus;
    readonly journeySnapshot: JourneySnapshot;
    readonly travellerSnapshots: ReadonlyArray<TravellerSnapshot>;
    readonly accommodationSnapshots?: ReadonlyArray<AccommodationSnapshot>;
    readonly pricingSnapshot?: PricingSnapshot;
    readonly paymentSnapshot?: PaymentSnapshot;
    readonly supplierReferences?: ReadonlyArray<SupplierReference>;
    readonly timeline?: ReservationTimeline;
    readonly metadata: ReservationMetadata;
}
export declare class Reservation {
    readonly identity: ReservationIdentity;
    readonly status: ReservationStatus;
    readonly journeySnapshot: JourneySnapshot;
    readonly travellerSnapshots: ReadonlyArray<TravellerSnapshot>;
    readonly accommodationSnapshots: ReadonlyArray<AccommodationSnapshot>;
    readonly pricingSnapshot?: PricingSnapshot;
    readonly paymentSnapshot?: PaymentSnapshot;
    readonly supplierReferences: ReadonlyArray<SupplierReference>;
    readonly timeline: ReservationTimeline;
    readonly metadata: ReservationMetadata;
    private constructor();
    static create(composition: ReservationComposition): Reservation;
    static restore(composition: ReservationComposition): Reservation;
}
//# sourceMappingURL=reservation.d.ts.map
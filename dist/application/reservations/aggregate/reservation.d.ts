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
export interface JourneySnapshot {
    readonly journeyId: string;
    readonly title: string;
    readonly startDate?: Date;
    readonly endDate?: Date;
    readonly summary?: string;
}
export interface TravellerSnapshot {
    readonly travellerId: string;
    readonly fullName: string;
    readonly email?: string;
    readonly phone?: string;
    readonly dateOfBirth?: Date;
}
export interface AccommodationSnapshot {
    readonly accommodationId: string;
    readonly name: string;
    readonly checkInDate?: Date;
    readonly checkOutDate?: Date;
    readonly roomType?: string;
}
export interface PricingSnapshot {
    readonly currency: string;
    readonly subtotal: number;
    readonly taxes: number;
    readonly total: number;
}
export interface PaymentSnapshot {
    readonly status: string;
    readonly method?: string;
    readonly paidAmount?: number;
    readonly currency?: string;
    readonly transactionReference?: string;
}
export interface SupplierReference {
    readonly supplier: string;
    readonly reference: string;
}
export interface ReservationTimelineEntry {
    readonly type: string;
    readonly occurredAt: Date;
    readonly note?: string;
}
export interface ReservationMetadata {
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly version: string;
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
    readonly timeline?: ReadonlyArray<ReservationTimelineEntry>;
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
    readonly timeline: ReadonlyArray<ReservationTimelineEntry>;
    readonly metadata: ReservationMetadata;
    private constructor();
    static create(composition: ReservationComposition): Reservation;
    static restore(composition: ReservationComposition): Reservation;
}
//# sourceMappingURL=reservation.d.ts.map
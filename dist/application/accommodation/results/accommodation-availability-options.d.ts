export type AccommodationAvailabilityRateStatus = "BOOKABLE" | "RECHECK_REQUIRED" | "UNAVAILABLE" | "UNKNOWN";
export interface AccommodationSupplierReference {
    readonly provider: string;
    readonly opaqueReference: string;
}
export interface AccommodationOccupancyRoom {
    readonly adults: number;
    readonly children: number;
    readonly childAges: ReadonlyArray<number>;
}
export interface AccommodationAvailabilityOccupancy {
    readonly rooms: ReadonlyArray<AccommodationOccupancyRoom>;
}
export interface AccommodationRatePricing {
    readonly amount: number;
    readonly currency: string;
    readonly basis?: string;
}
export interface AccommodationCancellationPolicy {
    readonly amount?: number;
    readonly from?: string;
    readonly percent?: number;
    readonly numberOfNights?: number;
}
export interface AccommodationTaxOrFee {
    readonly type?: string;
    readonly name?: string;
    readonly amount?: number;
    readonly currency?: string;
    readonly included?: boolean;
}
export interface AccommodationRateOption {
    readonly reference: AccommodationSupplierReference;
    readonly status: AccommodationAvailabilityRateStatus;
    readonly pricing: AccommodationRatePricing;
    readonly occupancy: AccommodationAvailabilityOccupancy;
    readonly board?: {
        readonly code?: string;
        readonly name?: string;
    };
    readonly allotment?: number;
    readonly payment?: {
        readonly type: string;
    };
    readonly packaging?: boolean;
    readonly cancellationPolicies: ReadonlyArray<AccommodationCancellationPolicy>;
    readonly taxes: ReadonlyArray<AccommodationTaxOrFee>;
}
export interface AccommodationRoomOption {
    readonly reference: AccommodationSupplierReference;
    readonly name: string;
    readonly rateOptions: ReadonlyArray<AccommodationRateOption>;
}
export interface AccommodationAvailabilityOptions {
    readonly roomOptions: ReadonlyArray<AccommodationRoomOption>;
}
//# sourceMappingURL=accommodation-availability-options.d.ts.map
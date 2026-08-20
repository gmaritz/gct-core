import { AccommodationAvailabilityOccupancy, AccommodationRateOption, AccommodationRoomOption, AccommodationSupplierReference } from "../../../accommodation";
export interface JourneyPackageStop {
    readonly packageId: string;
    readonly stopId: string;
    readonly stopOrder: number;
    readonly checkInDate: Date;
    readonly checkOutDate: Date;
    readonly approvedAccommodationIds?: ReadonlyArray<string>;
}
export interface JourneyAccommodationSelection {
    readonly accommodationId: string;
    readonly packageStopId?: string;
    readonly roomReference: AccommodationSupplierReference;
    readonly rateReference: AccommodationSupplierReference;
}
export interface JourneyAccommodationPricingInput {
    readonly packageStopId?: string;
    readonly accommodationId: string;
    readonly room: AccommodationRoomOption;
    readonly rate: AccommodationRateOption;
    readonly occupancy?: AccommodationAvailabilityOccupancy;
}
export interface JourneyAccommodationReservationInput extends JourneyAccommodationPricingInput {
    readonly provider: string;
    readonly supplierReference: AccommodationSupplierReference;
}
export interface JourneyAccommodation {
    readonly accommodationId: string;
    readonly name: string;
    readonly packageStop?: JourneyPackageStop;
    readonly provider?: string;
    readonly roomOptions?: ReadonlyArray<AccommodationRoomOption>;
    readonly requestedOccupancy?: AccommodationAvailabilityOccupancy;
    readonly selection?: JourneyAccommodationSelection;
    readonly pricingInput?: JourneyAccommodationPricingInput;
    readonly reservationInput?: JourneyAccommodationReservationInput;
}
export declare function selectJourneyAccommodation(option: JourneyAccommodation, selection: JourneyAccommodationSelection): JourneyAccommodation;
//# sourceMappingURL=journey-accommodation.d.ts.map
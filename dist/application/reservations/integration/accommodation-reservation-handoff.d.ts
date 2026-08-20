import { JourneyAccommodationPricingInput, JourneyAccommodationReservationInput } from "../../journeys/models";
import { AccommodationBookingGuest, AccommodationBookingHolder } from "../../accommodation/booking";
import { AccommodationBookingRequest } from "../../accommodation/booking";
import { AccommodationSnapshot } from "../models";
export interface AccommodationReservationHandoffInput {
    readonly packageId: string;
    readonly pricingInputs: ReadonlyArray<JourneyAccommodationPricingInput>;
    readonly reservationInputs: ReadonlyArray<JourneyAccommodationReservationInput>;
    readonly finalPackagePrice: {
        readonly amount: number;
        readonly currency: string;
    };
    readonly holder: AccommodationBookingHolder;
    readonly guests: ReadonlyArray<AccommodationBookingGuest>;
    readonly idempotencyKey: string;
}
export interface AccommodationReservationHandoff {
    readonly accommodationSnapshots: ReadonlyArray<AccommodationSnapshot>;
    readonly finalPackagePrice: {
        readonly amount: number;
        readonly currency: string;
    };
    readonly bookingRequests: ReadonlyArray<AccommodationBookingRequest>;
}
export declare function createAccommodationReservationSnapshots(input: AccommodationReservationHandoffInput): ReadonlyArray<AccommodationSnapshot>;
export declare function createAccommodationBookingRequests(input: AccommodationReservationHandoffInput): ReadonlyArray<AccommodationBookingRequest>;
export declare function createAccommodationReservationHandoff(input: AccommodationReservationHandoffInput): AccommodationReservationHandoff;
//# sourceMappingURL=accommodation-reservation-handoff.d.ts.map
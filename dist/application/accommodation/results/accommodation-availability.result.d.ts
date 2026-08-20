import { Accommodation } from "../models";
import { AccommodationResultMetadata } from "./accommodation-result-metadata";
import { AccommodationAvailabilityOptions, AccommodationAvailabilityOccupancy } from "./accommodation-availability-options";
export type AccommodationAvailabilityResult = {
    readonly kind: "ACCOMMODATION";
    readonly accommodation: Accommodation;
    readonly available: boolean;
    readonly metadata: AccommodationResultMetadata;
    readonly requestedOccupancy?: AccommodationAvailabilityOccupancy;
    readonly availabilityOptions?: AccommodationAvailabilityOptions;
    readonly results?: ReadonlyArray<AccommodationAvailabilityResult>;
} | {
    readonly kind: "NO_AVAILABILITY";
    readonly accommodation?: never;
    readonly available: false;
    readonly metadata: AccommodationResultMetadata;
};
export interface AccommodationAvailabilitySearchResult {
    readonly results: ReadonlyArray<AccommodationAvailabilityResult>;
    readonly metadata: AccommodationResultMetadata;
}
//# sourceMappingURL=accommodation-availability.result.d.ts.map
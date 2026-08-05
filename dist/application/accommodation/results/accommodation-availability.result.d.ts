import { Accommodation } from "../models";
import { AccommodationResultMetadata } from "./accommodation-result-metadata";
export interface AccommodationAvailabilityResult {
    readonly accommodation: Accommodation;
    readonly available: boolean;
    readonly metadata: AccommodationResultMetadata;
}
//# sourceMappingURL=accommodation-availability.result.d.ts.map
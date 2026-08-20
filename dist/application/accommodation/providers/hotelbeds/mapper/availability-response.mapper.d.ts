import { AccommodationAvailabilityResult, AccommodationAvailabilitySearchResult } from "../../../results";
import { HotelbedsAvailabilityRawResponse } from "../client";
export declare class HotelbedsAvailabilityResponseMapper {
    mapAvailabilityResponse(rawResponses: ReadonlyArray<HotelbedsAvailabilityRawResponse>): HotelbedsAvailabilityMappingResult;
}
export type HotelbedsAvailabilityMappingResult = {
    readonly kind: "ACCOMMODATION";
    readonly result: AccommodationAvailabilityResult;
    readonly results: AccommodationAvailabilitySearchResult["results"];
} | {
    readonly kind: "NO_AVAILABILITY";
};
//# sourceMappingURL=availability-response.mapper.d.ts.map
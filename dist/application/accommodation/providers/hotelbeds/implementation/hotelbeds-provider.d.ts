import { ProviderCapabilitySet } from "../../../capabilities";
import { Accommodation } from "../../../models";
import { AccommodationContentResult, AccommodationDetailsResult, AccommodationImageResult, AccommodationSearchResult } from "../../../results";
import { AccommodationRateResult } from "../../../rates";
import { AccommodationSearchCriteria } from "../../../discovery";
import { AccommodationProvider } from "../../accommodation-provider";
import { HotelbedsAvailabilityExecutionResult, HotelbedsAvailabilityExecutor, HotelbedsAvailabilityRequest, HotelbedsClient } from "../client";
import { HotelbedsHotel } from "../models";
export interface HotelbedsAccommodationMapper {
    mapHotel(hotel: HotelbedsHotel): Accommodation;
}
export declare class HotelbedsProvider implements AccommodationProvider {
    private readonly client;
    private readonly mapper;
    private readonly availabilityExecutor;
    readonly providerId = "hotelbeds";
    readonly capabilities: ProviderCapabilitySet;
    constructor(client?: HotelbedsClient, mapper?: HotelbedsAccommodationMapper, availabilityExecutor?: HotelbedsAvailabilityExecutor);
    search(criteria: AccommodationSearchCriteria): Promise<AccommodationSearchResult>;
    details(providerAccommodationId: string): Promise<AccommodationDetailsResult>;
    content(providerAccommodationId: string): Promise<AccommodationContentResult>;
    images(providerAccommodationId: string): Promise<AccommodationImageResult>;
    rates(query: import("../../../rates").AccommodationRateQuery): Promise<AccommodationRateResult>;
    executeAvailabilityRequests(requests: ReadonlyArray<HotelbedsAvailabilityRequest>): Promise<HotelbedsAvailabilityExecutionResult>;
}
//# sourceMappingURL=hotelbeds-provider.d.ts.map
import { ProviderCapabilitySet } from "../../../capabilities";
import { Accommodation } from "../../../models";
import { AccommodationContentResult, AccommodationDetailsResult, AccommodationImageResult, AccommodationSearchResult } from "../../../results";
import { AccommodationRateRevalidationRequest, AccommodationRateRevalidationResult } from "../../../revalidation";
import { AccommodationBookingRequest, AccommodationBookingResult } from "../../../booking";
import { AccommodationCancellationRequest, AccommodationCancellationResult } from "../../../cancellation";
import { AccommodationBookingModificationRequest, AccommodationBookingModificationResult } from "../../../modification";
import { AccommodationRateResult } from "../../../rates";
import { AccommodationSearchCriteria } from "../../../discovery";
import { AccommodationProvider } from "../../accommodation-provider";
import { HotelbedsAvailabilityMappingResult } from "../mapper";
import { HotelbedsAvailabilityExecutionResult, HotelbedsAvailabilityExecutor, HotelbedsAvailabilityRequest, HotelbedsClient } from "../client";
import { HotelbedsHotel } from "../models";
export interface HotelbedsAccommodationMapper {
    mapHotel(hotel: HotelbedsHotel): Accommodation;
}
export interface HotelbedsAvailabilityMapper {
    mapAvailabilityResponse(rawResponses: ReadonlyArray<HotelbedsAvailabilityExecutionResult["responses"][number]>): HotelbedsAvailabilityMappingResult;
}
export declare class HotelbedsProvider implements AccommodationProvider {
    private readonly client;
    private readonly mapper;
    private readonly availabilityExecutor;
    private readonly availabilityMapper;
    readonly providerId = "hotelbeds";
    readonly capabilities: ProviderCapabilitySet;
    constructor(client?: HotelbedsClient, mapper?: HotelbedsAccommodationMapper, availabilityExecutor?: HotelbedsAvailabilityExecutor, availabilityMapper?: HotelbedsAvailabilityMapper);
    search(criteria: AccommodationSearchCriteria): Promise<AccommodationSearchResult>;
    details(providerAccommodationId: string): Promise<AccommodationDetailsResult>;
    content(providerAccommodationId: string): Promise<AccommodationContentResult>;
    images(providerAccommodationId: string): Promise<AccommodationImageResult>;
    rates(query: import("../../../rates").AccommodationRateQuery): Promise<AccommodationRateResult>;
    revalidate(request: AccommodationRateRevalidationRequest): Promise<AccommodationRateRevalidationResult>;
    executeAvailabilityRequests(requests: ReadonlyArray<HotelbedsAvailabilityRequest>): Promise<HotelbedsAvailabilityExecutionResult>;
    mapAvailabilityResponse(rawResponses: ReadonlyArray<HotelbedsAvailabilityExecutionResult["responses"][number]>): HotelbedsAvailabilityMappingResult;
    book(request: AccommodationBookingRequest): Promise<AccommodationBookingResult>;
    cancelAccommodation(request: AccommodationCancellationRequest): Promise<AccommodationCancellationResult>;
    modifyBooking(request: AccommodationBookingModificationRequest): Promise<AccommodationBookingModificationResult>;
}
//# sourceMappingURL=hotelbeds-provider.d.ts.map
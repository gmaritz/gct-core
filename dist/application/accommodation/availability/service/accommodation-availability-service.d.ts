import { ApplicationService } from "../../../application-service";
import { HotelCatalogueService } from "../../catalogue";
import { AccommodationSearchQuery } from "../../discovery";
import { ProviderRegistry } from "../../registry";
import { AccommodationAvailabilityResult } from "../../results";
import { HotelbedsAvailabilityRequestBuilder } from "../../providers/hotelbeds/client";
export interface AccommodationAvailabilityService extends ApplicationService<AccommodationSearchQuery, AccommodationAvailabilityResult> {
    execute(query: AccommodationSearchQuery): Promise<AccommodationAvailabilityResult>;
}
export declare class DefaultAccommodationAvailabilityService implements AccommodationAvailabilityService {
    private readonly providerRegistry;
    private readonly catalogueService;
    private readonly requestBuilder;
    constructor(providerRegistry: ProviderRegistry, catalogueService?: HotelCatalogueService, requestBuilder?: HotelbedsAvailabilityRequestBuilder);
    execute(query: AccommodationSearchQuery): Promise<AccommodationAvailabilityResult>;
}
//# sourceMappingURL=accommodation-availability-service.d.ts.map
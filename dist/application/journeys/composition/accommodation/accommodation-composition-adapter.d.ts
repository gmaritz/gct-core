import { AccommodationSearchQuery, AccommodationSearchResult } from "../../../accommodation";
import { AccommodationContentQuery, AccommodationContentResult, AccommodationContentService } from "../../../accommodation";
import { AccommodationAvailabilityResult, AccommodationInventoryQuery, AccommodationInventoryService } from "../../../accommodation";
import { AccommodationRateQuery, AccommodationRateResult, AccommodationRateService } from "../../../accommodation";
import { AccommodationDiscoveryEngine } from "../../../accommodation";
import { AccommodationCompositionContext } from "./accommodation-composition-context";
import { AccommodationCompositionResult } from "./accommodation-composition-result";
interface AccommodationDiscoveryService {
    search(query: AccommodationSearchQuery): Promise<AccommodationSearchResult>;
}
interface AccommodationContentQueryService {
    execute(query: AccommodationContentQuery): Promise<AccommodationContentResult>;
}
interface AccommodationInventoryQueryService {
    execute(query: AccommodationInventoryQuery): Promise<AccommodationAvailabilityResult>;
}
interface AccommodationRateQueryService {
    execute(query: AccommodationRateQuery): Promise<AccommodationRateResult>;
}
export declare class AccommodationCompositionAdapter {
    private readonly discoveryService;
    private readonly contentService;
    private readonly inventoryService;
    private readonly rateService;
    constructor(discoveryService: AccommodationDiscoveryService, contentService: AccommodationContentQueryService, inventoryService: AccommodationInventoryQueryService, rateService: AccommodationRateQueryService);
    static fromServices(discoveryService: AccommodationDiscoveryEngine, contentService: AccommodationContentService, inventoryService: AccommodationInventoryService, rateService: AccommodationRateService): AccommodationCompositionAdapter;
    compose(context: AccommodationCompositionContext): Promise<AccommodationCompositionResult>;
    private composeAccommodation;
}
export {};
//# sourceMappingURL=accommodation-composition-adapter.d.ts.map
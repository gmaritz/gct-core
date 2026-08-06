import { ProviderRegistry } from "../registry";
import { AccommodationSearchResult } from "../results";
import { AccommodationSearchQuery } from "./accommodation-search-query";
import { AccommodationQueryValidator } from "./validation";
export interface AccommodationDiscoveryEngine {
    search(query: AccommodationSearchQuery): Promise<AccommodationSearchResult>;
}
export declare class DefaultAccommodationDiscoveryEngine implements AccommodationDiscoveryEngine {
    private readonly providerRegistry;
    private readonly queryValidator;
    constructor(providerRegistry: ProviderRegistry, queryValidator?: AccommodationQueryValidator);
    search(query: AccommodationSearchQuery): Promise<AccommodationSearchResult>;
}
//# sourceMappingURL=accommodation-discovery-engine.d.ts.map
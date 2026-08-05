import { ProviderRegistry } from "../registry";
import { AccommodationSearchResult } from "../results";
import { AccommodationSearchQuery } from "./accommodation-search-query";
export interface AccommodationDiscoveryEngine {
    search(query: AccommodationSearchQuery): Promise<AccommodationSearchResult>;
}
export declare class DefaultAccommodationDiscoveryEngine implements AccommodationDiscoveryEngine {
    private readonly providerRegistry;
    constructor(providerRegistry: ProviderRegistry);
    search(query: AccommodationSearchQuery): Promise<AccommodationSearchResult>;
}
//# sourceMappingURL=accommodation-discovery-engine.d.ts.map
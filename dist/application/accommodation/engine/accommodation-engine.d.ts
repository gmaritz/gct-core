import { AccommodationQueryValidator, AccommodationSearchQuery } from "../discovery";
import { ProviderRegistry } from "../registry";
import { AccommodationSearchResult } from "../results";
export interface AccommodationEngine {
    search(query: AccommodationSearchQuery): Promise<AccommodationSearchResult>;
}
export declare class DefaultAccommodationEngine implements AccommodationEngine {
    private readonly providerRegistry;
    private readonly queryValidator;
    constructor(providerRegistry: ProviderRegistry, queryValidator?: AccommodationQueryValidator);
    search(query: AccommodationSearchQuery): Promise<AccommodationSearchResult>;
}
//# sourceMappingURL=accommodation-engine.d.ts.map
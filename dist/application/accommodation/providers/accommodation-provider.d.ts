import { AccommodationSearchCriteria } from "../discovery";
import { ProviderCapabilitySet } from "../capabilities";
import { AccommodationSearchResult } from "../results";
import type { AccommodationRateRevalidationRequest, AccommodationRateRevalidationResult } from "../revalidation";
export interface AccommodationProvider {
    readonly providerId: string;
    readonly capabilities: ProviderCapabilitySet;
    search(criteria: AccommodationSearchCriteria): Promise<AccommodationSearchResult>;
    revalidate?(request: AccommodationRateRevalidationRequest): Promise<AccommodationRateRevalidationResult>;
}
//# sourceMappingURL=accommodation-provider.d.ts.map
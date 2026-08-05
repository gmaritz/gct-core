import { ProviderCapabilitySet } from "../capabilities";
import { AccommodationSearchResult } from "../results";
export interface AccommodationProvider {
    readonly providerId: string;
    readonly capabilities: ProviderCapabilitySet;
    search(): Promise<AccommodationSearchResult>;
}
//# sourceMappingURL=accommodation-provider.d.ts.map
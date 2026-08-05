import { AccommodationSearchQuery, DefaultAccommodationDiscoveryEngine } from "../discovery";
import { ProviderRegistry } from "../registry";
import { AccommodationSearchResult } from "../results";

export interface AccommodationEngine {
  search(query: AccommodationSearchQuery): Promise<AccommodationSearchResult>;
}

export class DefaultAccommodationEngine implements AccommodationEngine {
  public constructor(private readonly providerRegistry: ProviderRegistry) {}

  public async search(query: AccommodationSearchQuery): Promise<AccommodationSearchResult> {
    const discoveryEngine = new DefaultAccommodationDiscoveryEngine(this.providerRegistry);

    return discoveryEngine.search(query);
  }
}

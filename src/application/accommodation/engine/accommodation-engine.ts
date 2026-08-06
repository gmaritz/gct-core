import {
  AccommodationQueryValidator,
  AccommodationSearchQuery,
  DefaultAccommodationDiscoveryEngine,
} from "../discovery";
import { ProviderRegistry } from "../registry";
import { AccommodationSearchResult } from "../results";

export interface AccommodationEngine {
  search(query: AccommodationSearchQuery): Promise<AccommodationSearchResult>;
}

export class DefaultAccommodationEngine implements AccommodationEngine {
  public constructor(
    private readonly providerRegistry: ProviderRegistry,
    private readonly queryValidator: AccommodationQueryValidator = new AccommodationQueryValidator(),
  ) {}

  public async search(query: AccommodationSearchQuery): Promise<AccommodationSearchResult> {
    const discoveryEngine = new DefaultAccommodationDiscoveryEngine(
      this.providerRegistry,
      this.queryValidator,
    );

    return discoveryEngine.search(query);
  }
}

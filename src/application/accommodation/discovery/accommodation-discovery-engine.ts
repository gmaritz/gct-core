import { AccommodationProviderCapabilityType } from "../capabilities";
import { ProviderRegistry } from "../registry";
import { AccommodationResultMetadata, AccommodationSearchResult } from "../results";

import { AccommodationSearchQuery } from "./accommodation-search-query";
import { AccommodationQueryValidator } from "./validation";

export interface AccommodationDiscoveryEngine {
  search(query: AccommodationSearchQuery): Promise<AccommodationSearchResult>;
}

function createMetadata(): AccommodationResultMetadata {
  return {
    generatedAt: new Date(),
    version: "1.0.0",
  };
}

export class DefaultAccommodationDiscoveryEngine implements AccommodationDiscoveryEngine {
  public constructor(
    private readonly providerRegistry: ProviderRegistry,
    private readonly queryValidator: AccommodationQueryValidator = new AccommodationQueryValidator(),
  ) {}

  public async search(query: AccommodationSearchQuery): Promise<AccommodationSearchResult> {
    const validationResult = this.queryValidator.validate(query);

    if (!validationResult.valid) {
      throw new Error(
        `Accommodation query validation failed: ${validationResult.errors
          .map((error) => error.code)
          .join(", ")}`,
      );
    }

    const providers = this.providerRegistry.findProviders(AccommodationProviderCapabilityType.SEARCH);
    const providerResults = await Promise.allSettled(
      providers.map(async (provider) => provider.search(query.criteria)),
    );

    const accommodations = providerResults.flatMap((providerResult) =>
      providerResult.status === "fulfilled" ? providerResult.value.accommodations : [],
    );

    return {
      accommodations,
      metadata: createMetadata(),
    };
  }
}
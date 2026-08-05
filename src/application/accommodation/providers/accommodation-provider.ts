import { AccommodationSearchCriteria } from "../discovery";
import { ProviderCapabilitySet } from "../capabilities";
import { AccommodationSearchResult } from "../results";

export interface AccommodationProvider {
  readonly providerId: string;
  readonly capabilities: ProviderCapabilitySet;
  search(criteria: AccommodationSearchCriteria): Promise<AccommodationSearchResult>;
}

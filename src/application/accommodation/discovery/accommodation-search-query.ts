import { AccommodationSearchContext } from "./accommodation-search-context";
import { AccommodationSearchCriteria } from "./accommodation-search-criteria";

export interface AccommodationSearchQuery {
  readonly criteria: AccommodationSearchCriteria;
  readonly context: AccommodationSearchContext;
}
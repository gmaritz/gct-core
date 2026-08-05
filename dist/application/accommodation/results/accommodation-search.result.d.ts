import { Accommodation } from "../models";
import { AccommodationResultMetadata } from "./accommodation-result-metadata";
export interface AccommodationSearchResult {
    readonly accommodations: ReadonlyArray<Accommodation>;
    readonly metadata: AccommodationResultMetadata;
}
//# sourceMappingURL=accommodation-search.result.d.ts.map
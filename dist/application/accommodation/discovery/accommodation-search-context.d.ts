import { AccommodationSearchSource } from "./accommodation-search-source";
export interface AccommodationSearchContext {
    readonly requestId: string;
    readonly source: AccommodationSearchSource;
    readonly channel: string;
    readonly locale: string;
    readonly currency: string;
    readonly timestamp: Date;
}
//# sourceMappingURL=accommodation-search-context.d.ts.map
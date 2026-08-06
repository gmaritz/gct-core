import { AccommodationContentLocale } from "./accommodation-content-locale";
import { AccommodationContentSource } from "./accommodation-content-source";
export interface AccommodationContentContext {
    readonly requestId: string;
    readonly source: AccommodationContentSource;
    readonly locale: AccommodationContentLocale;
    readonly timestamp: Date;
}
//# sourceMappingURL=accommodation-content-context.d.ts.map
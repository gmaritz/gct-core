import { AccommodationRateContext } from "./accommodation-rate-context";
import { AccommodationRateSelectionStrategy } from "./accommodation-rate-selection-strategy";
import { AccommodationStayPeriod } from "./accommodation-stay-period";
import { AccommodationOccupancy } from "./accommodation-occupancy";
export interface AccommodationRateQuery {
    readonly identifier: string;
    readonly stayPeriod: AccommodationStayPeriod;
    readonly occupancy: AccommodationOccupancy;
    readonly selectionStrategy: AccommodationRateSelectionStrategy;
    readonly context: AccommodationRateContext;
}
//# sourceMappingURL=accommodation-rate-query.d.ts.map
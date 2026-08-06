import { AccommodationResultMetadata } from "../../results";
import { AccommodationOccupancy } from "./accommodation-occupancy";
import { AccommodationRate } from "./accommodation-rate";
import { AccommodationRateSelectionStrategy } from "./accommodation-rate-selection-strategy";
import { AccommodationStayPeriod } from "./accommodation-stay-period";
export interface AccommodationRateResult {
    readonly accommodationId: string;
    readonly stayPeriod: AccommodationStayPeriod;
    readonly occupancy: AccommodationOccupancy;
    readonly selectionStrategy: AccommodationRateSelectionStrategy;
    readonly rates: ReadonlyArray<AccommodationRate>;
    readonly metadata: AccommodationResultMetadata;
}
//# sourceMappingURL=accommodation-rate-result.d.ts.map
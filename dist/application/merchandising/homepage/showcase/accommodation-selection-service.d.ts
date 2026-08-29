import { DynamicHomepageJourneyResolver } from "./dynamic-homepage-journey-resolver";
import { JourneySelectionStore } from "./journey-selection-store";
export type AccommodationSelectionStatus = "COMPLETE" | "INVALID" | "NOT_FOUND" | "UNAVAILABLE" | "INCOMPLETE" | "STALE";
export interface AccommodationSelectionInput {
    readonly stopId?: string;
    readonly accommodationId: string;
    readonly roomReference: {
        readonly provider: string;
        readonly opaqueReference: string;
    };
    readonly rateReference: {
        readonly provider: string;
        readonly opaqueReference: string;
    };
}
export interface AccommodationSelectionResult {
    readonly status: AccommodationSelectionStatus;
    readonly journeyId: string;
    readonly selectedStops: ReadonlyArray<{
        readonly stopId?: string;
        readonly accommodationId: string;
        readonly roomReference: string;
        readonly rateReference: string;
    }>;
}
export interface AccommodationSelectionService {
    selectAccommodation(journeyId: string, selections: ReadonlyArray<AccommodationSelectionInput>): Promise<AccommodationSelectionResult>;
}
export declare class DefaultAccommodationSelectionService implements AccommodationSelectionService {
    private readonly resolver;
    private readonly selectionStore;
    constructor(resolver: DynamicHomepageJourneyResolver, selectionStore?: JourneySelectionStore);
    selectAccommodation(journeyId: string, selections: ReadonlyArray<AccommodationSelectionInput>): Promise<AccommodationSelectionResult>;
}
//# sourceMappingURL=accommodation-selection-service.d.ts.map
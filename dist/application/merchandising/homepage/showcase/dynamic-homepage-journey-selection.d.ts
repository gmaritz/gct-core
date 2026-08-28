import { DynamicHomepageJourneyResolver } from "./dynamic-homepage-journey-resolver";
export type DynamicHomepageJourneySelectionStatus = "SELECTED" | "INVALID" | "NOT_FOUND" | "UNAVAILABLE";
export interface DynamicHomepageJourneySelectionResult {
    readonly status: DynamicHomepageJourneySelectionStatus;
    readonly journeyId: string;
    readonly title?: string;
    readonly continuationHref?: string;
}
export interface DynamicHomepageJourneySelector {
    selectJourney(journeyId: string): Promise<DynamicHomepageJourneySelectionResult>;
}
export declare class DefaultDynamicHomepageJourneySelector implements DynamicHomepageJourneySelector {
    private readonly resolver;
    constructor(resolver?: DynamicHomepageJourneyResolver);
    selectJourney(journeyId: string): Promise<DynamicHomepageJourneySelectionResult>;
}
//# sourceMappingURL=dynamic-homepage-journey-selection.d.ts.map
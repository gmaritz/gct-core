import { HomepageJourneyViewModel } from "../../../journeys/presentation";
export interface HomepageJourneyShowcaseResultMetadata {
    readonly generatedAt: Date;
    readonly version: string;
}
export interface HomepageJourneyShowcaseResult {
    readonly success: boolean;
    readonly featuredJourneys: ReadonlyArray<HomepageJourneyViewModel>;
    readonly metadata: HomepageJourneyShowcaseResultMetadata;
}
export declare function createHomepageJourneyShowcaseResult(result: HomepageJourneyShowcaseResult): HomepageJourneyShowcaseResult;
//# sourceMappingURL=homepage-journey-showcase-result.d.ts.map
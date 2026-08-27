import { JourneyCompositionQuery, JourneyCompositionResult, JourneyCompositionService, JourneyPresentationMapper, JourneyType, JourneyViewModelProvider } from "../../../journeys";
import { HomepageJourneyShowcaseResult } from "./homepage-journey-showcase-result";
export interface JourneyCompositionExecutor {
    execute(query: JourneyCompositionQuery): Promise<JourneyCompositionResult>;
}
export interface FeaturedJourneyDefinition {
    readonly requestId: string;
    readonly destination: string;
    readonly journeyType: JourneyType;
    readonly days: number;
    readonly nights: number;
}
export declare const FEATURED_JOURNEYS: ReadonlyArray<FeaturedJourneyDefinition>;
export declare function createHomepageJourneyQuery(feature: FeaturedJourneyDefinition, timestamp?: Date): JourneyCompositionQuery;
export declare function createDefaultJourneyCompositionService(): JourneyCompositionService;
export declare class HomepageJourneyShowcaseService {
    private readonly journeyCompositionService;
    private readonly presentationMapper;
    private readonly viewModelProvider;
    constructor(journeyCompositionService: JourneyCompositionExecutor, presentationMapper: JourneyPresentationMapper, viewModelProvider: JourneyViewModelProvider);
    execute(): Promise<HomepageJourneyShowcaseResult>;
}
export declare function createDefaultHomepageJourneyShowcaseService(): HomepageJourneyShowcaseService;
//# sourceMappingURL=homepage-journey-showcase-service.d.ts.map
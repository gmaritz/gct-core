import { JourneyCompositionQuery, JourneyCompositionResult, JourneyPresentationMapper, JourneyViewModelProvider } from "../../../journeys";
import { HomepageJourneyShowcaseResult } from "./homepage-journey-showcase-result";
interface JourneyCompositionExecutor {
    execute(query: JourneyCompositionQuery): Promise<JourneyCompositionResult>;
}
export declare class HomepageJourneyShowcaseService {
    private readonly journeyCompositionService;
    private readonly presentationMapper;
    private readonly viewModelProvider;
    constructor(journeyCompositionService: JourneyCompositionExecutor, presentationMapper: JourneyPresentationMapper, viewModelProvider: JourneyViewModelProvider);
    execute(): Promise<HomepageJourneyShowcaseResult>;
}
export declare function createDefaultHomepageJourneyShowcaseService(): HomepageJourneyShowcaseService;
export {};
//# sourceMappingURL=homepage-journey-showcase-service.d.ts.map
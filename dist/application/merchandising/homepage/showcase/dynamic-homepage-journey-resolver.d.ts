import { Journey } from "../../../journeys";
import { JourneyCompositionExecutor } from "./homepage-journey-showcase-service";
export type DynamicHomepageJourneyResolutionStatus = "RESOLVED" | "INVALID" | "NOT_FOUND" | "UNAVAILABLE";
export interface DynamicHomepageJourneyResolution {
    readonly status: DynamicHomepageJourneyResolutionStatus;
    readonly journey?: Journey;
}
export interface DynamicHomepageJourneyResolver {
    resolve(publicJourneyId: string): Promise<DynamicHomepageJourneyResolution>;
}
export declare class DefaultDynamicHomepageJourneyResolver implements DynamicHomepageJourneyResolver {
    private readonly compositionService;
    constructor(compositionService?: JourneyCompositionExecutor);
    resolve(publicJourneyId: string): Promise<DynamicHomepageJourneyResolution>;
}
//# sourceMappingURL=dynamic-homepage-journey-resolver.d.ts.map
import { Journey } from "../../../journeys";
import {
  createDefaultJourneyCompositionService,
  createHomepageJourneyQuery,
  FEATURED_JOURNEYS,
  JourneyCompositionExecutor,
} from "./homepage-journey-showcase-service";

export type DynamicHomepageJourneyResolutionStatus = "RESOLVED" | "INVALID" | "NOT_FOUND" | "UNAVAILABLE";

export interface DynamicHomepageJourneyResolution {
  readonly status: DynamicHomepageJourneyResolutionStatus;
  readonly journey?: Journey;
}

export interface DynamicHomepageJourneyResolver {
  resolve(publicJourneyId: string): Promise<DynamicHomepageJourneyResolution>;
}

export class DefaultDynamicHomepageJourneyResolver implements DynamicHomepageJourneyResolver {
  public constructor(
    private readonly compositionService: JourneyCompositionExecutor = createDefaultJourneyCompositionService(),
  ) {}

  public async resolve(publicJourneyId: string): Promise<DynamicHomepageJourneyResolution> {
    if (typeof publicJourneyId !== "string" || !/^journey-homepage-journey-\d{3}$/.test(publicJourneyId)) {
      return { status: "INVALID" };
    }

    const feature = FEATURED_JOURNEYS.find(
      (candidate) => `journey-${candidate.requestId}` === publicJourneyId,
    );

    if (!feature) {
      return { status: "NOT_FOUND" };
    }

    const result = await this.compositionService.execute(createHomepageJourneyQuery(feature));

    if (!result.success || !result.payload) {
      return { status: "UNAVAILABLE" };
    }

    return { status: "RESOLVED", journey: result.payload };
  }
}
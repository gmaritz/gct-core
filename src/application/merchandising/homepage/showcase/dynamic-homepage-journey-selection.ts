import {
  DefaultDynamicHomepageJourneyResolver,
  DynamicHomepageJourneyResolution,
  DynamicHomepageJourneyResolver,
} from "./dynamic-homepage-journey-resolver";

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

function toSelectionResult(
  journeyId: string,
  resolution: DynamicHomepageJourneyResolution,
): DynamicHomepageJourneySelectionResult {
  if (resolution.status !== "RESOLVED" || !resolution.journey) {
    return {
      status: resolution.status === "RESOLVED" ? "UNAVAILABLE" : resolution.status,
      journeyId,
    };
  }

  return {
    status: "SELECTED",
    journeyId,
    title: `${resolution.journey.classification.category} ${resolution.journey.destinations[0]?.name ?? "Journey"} Journey`,
    continuationHref: `/ui/journeys/${journeyId}/selected`,
  };
}

export class DefaultDynamicHomepageJourneySelector implements DynamicHomepageJourneySelector {
  public constructor(
    private readonly resolver: DynamicHomepageJourneyResolver = new DefaultDynamicHomepageJourneyResolver(),
  ) {}

  public async selectJourney(journeyId: string): Promise<DynamicHomepageJourneySelectionResult> {
    return toSelectionResult(journeyId, await this.resolver.resolve(journeyId));
  }
}
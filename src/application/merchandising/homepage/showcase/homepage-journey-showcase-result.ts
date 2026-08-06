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

export function createHomepageJourneyShowcaseResult(
  result: HomepageJourneyShowcaseResult,
): HomepageJourneyShowcaseResult {
  return Object.freeze({
    success: result.success,
    featuredJourneys: Object.freeze(
      result.featuredJourneys.map((journey) =>
        Object.freeze({
          id: journey.id,
          title: journey.title,
          subtitle: journey.subtitle,
          destination: journey.destination,
          duration: journey.duration,
          image: Object.freeze({ ...journey.image }),
          highlights: Object.freeze([...journey.highlights]),
          accommodationSummary: journey.accommodationSummary,
          experienceSummary: journey.experienceSummary,
          price: journey.price ? Object.freeze({ ...journey.price }) : undefined,
          badges: Object.freeze([...journey.badges]),
          primaryCTA: Object.freeze({ ...journey.primaryCTA }),
        }),
      ),
    ),
    metadata: Object.freeze({
      generatedAt: new Date(result.metadata.generatedAt),
      version: result.metadata.version,
    }),
  });
}
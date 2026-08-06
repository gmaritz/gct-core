import {
  JourneyDuration,
  JourneyOperatingSeason,
  JourneyType,
} from "@application/journeys/models";

export interface ExperienceTravellerProfile {
  readonly adults: number;
  readonly children: number;
  readonly privateOnly?: boolean;
  readonly audience?: string;
}

export interface ExperienceCompositionContext {
  readonly destination: string;
  readonly journeyType: JourneyType;
  readonly travellerProfile: ExperienceTravellerProfile;
  readonly interests: ReadonlyArray<string>;
  readonly duration: JourneyDuration;
  readonly operatingSeason?: JourneyOperatingSeason;
  readonly requestedAt: Date;
}

export function createExperienceCompositionContext(
  context: ExperienceCompositionContext,
): ExperienceCompositionContext {
  return Object.freeze({
    destination: context.destination,
    journeyType: context.journeyType,
    travellerProfile: Object.freeze({ ...context.travellerProfile }),
    interests: Object.freeze([...context.interests]),
    duration: Object.freeze({ ...context.duration }),
    operatingSeason: context.operatingSeason
      ? Object.freeze({
          seasons: Object.freeze([...context.operatingSeason.seasons]),
          yearRound: context.operatingSeason.yearRound,
        })
      : undefined,
    requestedAt: new Date(context.requestedAt),
  });
}
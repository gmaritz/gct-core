import {
  Journey,
  JourneyComposition,
  JourneyCategory,
  JourneyDestination,
  JourneyExperience,
  JourneyLifecycle,
  JourneyStatus,
  JourneyTag,
  JourneyType,
} from "../../aggregate";

import { JourneyCompositionContext } from "../models";

export interface JourneyFactoryInput {
  readonly context: JourneyCompositionContext;
  readonly accommodation: ReadonlyArray<JourneyComposition["accommodation"][number]>;
  readonly experiences: ReadonlyArray<JourneyExperience>;
}

function mapCategory(journeyType: JourneyType | string | undefined): string {
  switch (journeyType) {
    case JourneyType.DAY_TOUR:
      return JourneyCategory.CLASSIC;
    case JourneyType.MULTI_DAY:
      return JourneyCategory.ADVENTURE;
    case JourneyType.PRIVATE:
      return JourneyCategory.LUXURY;
    case JourneyType.PACKAGE:
    default:
      return JourneyCategory.SIGNATURE;
  }
}

function createDestinations(context: JourneyCompositionContext): ReadonlyArray<JourneyDestination> {
  const destinations = context.query.destinationRequirements?.destinations ?? [];
  return Object.freeze(
    destinations
      .filter((destination) => typeof destination?.name === "string" && destination.name.trim().length > 0)
      .map((destination) => Object.freeze({ name: destination.name!.trim() })),
  );
}

function createTags(context: JourneyCompositionContext): ReadonlyArray<JourneyTag> {
  return Object.freeze(
    context.experienceContext.interests
      .filter((interest) => interest.trim().length > 0)
      .map((interest) => Object.freeze({ value: interest })),
  );
}

function ensureInvariant(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export class JourneyFactory {
  public create(input: JourneyFactoryInput): Journey {
    const { context } = input;

    const destinations = createDestinations(context);

    ensureInvariant(destinations.length > 0, "Journey factory requires at least one destination.");
    ensureInvariant(
      typeof context.query.context?.requestId === "string" && context.query.context.requestId.trim().length > 0,
      "Journey factory requires a request ID.",
    );

    const journeyType = context.query.journeyType ?? JourneyType.PACKAGE;
    const duration = context.query.stayRequirements?.duration;
    const travellerRules = context.query.travellerRequirements;

    const composition: JourneyComposition = {
      identity: Object.freeze({
        id: `journey-${context.query.context!.requestId}`,
      }),
      classification: Object.freeze({
        type: typeof journeyType === "string" ? journeyType : JourneyType.PACKAGE,
        category: mapCategory(journeyType),
      }),
      metadata: Object.freeze({
        created: new Date(context.createdAt),
        modified: new Date(context.createdAt),
        version: "1.0.0",
        source: "APP-003.7",
      }),
      status: JourneyStatus.DRAFT,
      lifecycle: JourneyLifecycle.DESIGN,
      duration: Object.freeze({
        days: duration?.days,
        nights: duration?.nights,
        description: duration?.description,
      }),
      destinations,
      accommodation: Object.freeze(input.accommodation.map((item) => Object.freeze({ ...item }))),
      experiences: Object.freeze(input.experiences.map((item) => Object.freeze({ ...item }))),
      travellerRules: Object.freeze({
        minimumTravellers: travellerRules?.minimumTravellers,
        maximumTravellers: travellerRules?.maximumTravellers,
        privateOnly: travellerRules?.privateOnly,
        ageRestriction: travellerRules?.ageRestriction,
      }),
      tags: createTags(context),
    };

    return Journey.create(composition);
  }
}
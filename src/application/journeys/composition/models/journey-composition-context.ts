import { Journey } from "../../aggregate";
import { JourneyType } from "../../models";
import {
  JourneyCompositionQuery,
  JourneyCompositionSource,
} from "../../validation";
import {
  JourneyCompositionPolicyContext,
} from "../../policies";
import {
  AccommodationCompositionContext,
} from "../accommodation";
import {
  createExperienceCompositionContext,
  ExperienceCompositionContext,
} from "../experiences";

function mapSource(source: JourneyCompositionSource | string | undefined): JourneyCompositionSource {
  if (source === JourneyCompositionSource.HOMEPAGE
    || source === JourneyCompositionSource.PACKAGE_DESIGNER
    || source === JourneyCompositionSource.PACKAGE_DETAILS
    || source === JourneyCompositionSource.ADMIN
    || source === JourneyCompositionSource.API
    || source === JourneyCompositionSource.INTERNAL) {
    return source;
  }

  return JourneyCompositionSource.INTERNAL;
}

function mapJourneyType(type: JourneyType | string | undefined): JourneyType {
  if (type === JourneyType.DAY_TOUR
    || type === JourneyType.MULTI_DAY
    || type === JourneyType.PACKAGE
    || type === JourneyType.PRIVATE) {
    return type;
  }

  return JourneyType.PACKAGE;
}

function firstDestination(query: JourneyCompositionQuery): string {
  return query.destinationRequirements?.destinations?.[0]?.name ?? "";
}

export interface JourneyCompositionContext {
  readonly query: JourneyCompositionQuery;
  readonly policyContext: JourneyCompositionPolicyContext;
  readonly accommodationContext: AccommodationCompositionContext;
  readonly experienceContext: ExperienceCompositionContext;
  readonly createdAt: Date;
}

export function createJourneyCompositionContext(
  query: JourneyCompositionQuery,
  aggregate?: Journey,
): JourneyCompositionContext {
  const createdAt = new Date(query.context?.timestamp ?? new Date());
  const source = mapSource(query.context?.source);
  const journeyType = mapJourneyType(query.journeyType);
  const destination = firstDestination(query);

  const travellerRequirements = query.travellerRequirements;
  const duration = query.stayRequirements?.duration;

  const accommodationContext: AccommodationCompositionContext = Object.freeze({
    requestId: query.context?.requestId ?? "",
    source,
    timestamp: createdAt,
    destination,
    checkInDate: new Date(createdAt),
    checkOutDate: new Date(createdAt),
    adults: travellerRequirements?.minimumTravellers ?? 1,
    children: 0,
    rooms: 1,
    channel: "WEB",
    locale: "EN",
    market: "ZA",
  });

  const experienceContext = createExperienceCompositionContext({
    destination,
    journeyType,
    travellerProfile: {
      adults: travellerRequirements?.minimumTravellers ?? 1,
      children: 0,
      privateOnly: travellerRequirements?.privateOnly,
    },
    interests: Object.freeze([]),
    duration: {
      days: duration?.days,
      nights: duration?.nights,
      description: duration?.description,
    },
    requestedAt: createdAt,
  });

  return Object.freeze({
    query,
    policyContext: Object.freeze({ query, aggregate }),
    accommodationContext,
    experienceContext,
    createdAt,
  });
}
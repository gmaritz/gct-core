import {
  Journey,
  JourneyClassification,
  JourneyDestination,
  JourneyDuration,
  JourneyTravellerRules,
} from "../../aggregate";

import {
  createJourneyValidationResult,
  JourneyValidationError,
  JourneyValidationErrorCode,
  JourneyValidationResult,
} from "../models";

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidIntegerAtLeast(value: unknown, minimum: number): boolean {
  return typeof value === "number" && Number.isInteger(value) && value >= minimum;
}

function createError(code: JourneyValidationErrorCode, message: string): JourneyValidationError {
  return Object.freeze({ code, message });
}

function isValidClassification(classification: JourneyClassification | undefined): boolean {
  return isObject(classification) && !isBlank(classification.type) && !isBlank(classification.category);
}

function isValidDuration(duration: JourneyDuration | undefined): boolean {
  if (!isObject(duration)) {
    return false;
  }

  const journeyDuration = duration as JourneyDuration;

  return (
    isValidIntegerAtLeast(journeyDuration.days, 1) &&
    isValidIntegerAtLeast(journeyDuration.nights, 0) &&
    typeof journeyDuration.description === "string" &&
    !isBlank(journeyDuration.description) &&
    (journeyDuration.nights as number) <= (journeyDuration.days as number)
  );
}

function isValidDestinations(destinations: ReadonlyArray<JourneyDestination> | undefined): boolean {
  return Array.isArray(destinations) && destinations.length > 0 && destinations.every((destination) => !isBlank(destination?.name));
}

function isValidTravellerRules(rules: JourneyTravellerRules | undefined): boolean {
  if (!isObject(rules)) {
    return false;
  }

  const travellerRules = rules as JourneyTravellerRules;

  return (
    isValidIntegerAtLeast(travellerRules.minimumTravellers, 1) &&
    isValidIntegerAtLeast(travellerRules.maximumTravellers, travellerRules.minimumTravellers ?? 1) &&
    (typeof travellerRules.privateOnly === "undefined" || typeof travellerRules.privateOnly === "boolean") &&
    (typeof travellerRules.ageRestriction === "undefined" || !isBlank(travellerRules.ageRestriction))
  );
}

export class JourneyAggregateValidator {
  public validate(aggregate: Journey | null | undefined): JourneyValidationResult {
    const errors: JourneyValidationError[] = [];

    if (!isObject(aggregate)) {
      errors.push(createError(JourneyValidationErrorCode.INVALID_AGGREGATE, "Journey aggregate is required."));
      return createJourneyValidationResult(errors);
    }

    if (!aggregate.identity || isBlank(aggregate.identity.id)) {
      errors.push(createError(JourneyValidationErrorCode.MISSING_IDENTITY, "Journey identity is required."));
    }

    if (!isValidClassification(aggregate.classification)) {
      errors.push(createError(JourneyValidationErrorCode.INVALID_CLASSIFICATION, "Journey classification is invalid."));
    }

    if (!isValidDuration(aggregate.duration)) {
      errors.push(createError(JourneyValidationErrorCode.INVALID_DURATION, "Journey duration is invalid."));
    }

    if (!isValidDestinations(aggregate.destinations)) {
      errors.push(createError(JourneyValidationErrorCode.INVALID_DESTINATION, "Journey destinations are required."));
    }

    if (!isValidTravellerRules(aggregate.travellerRules)) {
      errors.push(createError(JourneyValidationErrorCode.INVALID_TRAVELLER_RULES, "Journey traveller rules are invalid."));
    }

    if (typeof aggregate.status !== "string" || typeof aggregate.lifecycle !== "string") {
      errors.push(createError(JourneyValidationErrorCode.INVALID_AGGREGATE, "Journey aggregate state is internally inconsistent."));
    }

    return createJourneyValidationResult(errors);
  }
}
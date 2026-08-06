import { JourneyType } from "../../models";

import {
  createJourneyValidationResult,
  JourneyValidationError,
  JourneyValidationErrorCode,
  JourneyValidationResult,
} from "../models";
import {
  JourneyCompositionQuery,
  JourneyCompositionStrategy,
} from "../query";

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

function isEnumValue<T extends Record<string, string>>(value: unknown, enumeration: T): value is T[keyof T] {
  return typeof value === "string" && Object.values(enumeration).includes(value as T[keyof T]);
}

function createError(code: JourneyValidationErrorCode, message: string): JourneyValidationError {
  return Object.freeze({ code, message });
}

function hasDestination(query: JourneyCompositionQuery): boolean {
  const destinations = query.destinationRequirements?.destinations;

  if (!Array.isArray(destinations) || destinations.length === 0) {
    return false;
  }

  return destinations.every((destination) => !isBlank(destination?.name));
}

function isDurationCompatible(query: JourneyCompositionQuery): boolean {
  const duration = query.stayRequirements?.duration;

  if (!duration || typeof duration.days !== "number" || typeof duration.nights !== "number") {
    return false;
  }

  if (!Number.isInteger(duration.days) || !Number.isInteger(duration.nights)) {
    return false;
  }

  if (query.journeyType === JourneyType.DAY_TOUR) {
    return duration.days === 1 && duration.nights === 0;
  }

  if (query.journeyType === JourneyType.MULTI_DAY || query.journeyType === JourneyType.PACKAGE) {
    return duration.days >= 2 && duration.nights >= 1;
  }

  return duration.days >= 1 && duration.nights >= 0;
}

export class JourneyCompositionValidator {
  public validate(query: JourneyCompositionQuery): JourneyValidationResult {
    const errors: JourneyValidationError[] = [];

    if (!isEnumValue(query.journeyType, JourneyType)) {
      errors.push(createError(JourneyValidationErrorCode.INVALID_JOURNEY_TYPE, "Journey type is unsupported for composition."));
    }

    if (!isEnumValue(query.strategy, JourneyCompositionStrategy)) {
      errors.push(createError(JourneyValidationErrorCode.INVALID_STRATEGY, "Composition strategy is unsupported."));
    }

    if (!hasDestination(query)) {
      errors.push(createError(JourneyValidationErrorCode.INVALID_DESTINATION, "At least one destination is required."));
    }

    if (!isDurationCompatible(query)) {
      errors.push(createError(JourneyValidationErrorCode.INVALID_DURATION, "Journey duration is incompatible with the selected journey type."));
    }

    return createJourneyValidationResult(errors);
  }
}
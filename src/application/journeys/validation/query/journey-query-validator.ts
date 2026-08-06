import {
  JourneyDuration,
  JourneyType,
  JourneyTravellerRules,
} from "../../models";

import { JourneyValidationErrorCode } from "../models";
import {
  createJourneyValidationResult,
  JourneyValidationError,
  JourneyValidationResult,
} from "../models";

export enum JourneyCompositionStrategy {
  STANDARD = "STANDARD",
  CURATED = "CURATED",
  DYNAMIC = "DYNAMIC",
}

export enum JourneyCompositionSource {
  HOMEPAGE = "HOMEPAGE",
  PACKAGE_DESIGNER = "PACKAGE_DESIGNER",
  PACKAGE_DETAILS = "PACKAGE_DETAILS",
  ADMIN = "ADMIN",
  API = "API",
  INTERNAL = "INTERNAL",
}

export interface JourneyCompositionContext {
  readonly requestId?: string;
  readonly source?: JourneyCompositionSource | string;
  readonly timestamp?: Date;
}

export interface JourneyDestinationRequirement {
  readonly name?: string;
}

export interface JourneyDestinationRequirements {
  readonly destinations?: ReadonlyArray<JourneyDestinationRequirement>;
}

export interface JourneyStayRequirements {
  readonly duration?: JourneyDuration;
}

export interface JourneyTravellerRequirements extends JourneyTravellerRules {}

export interface JourneyCompositionQuery {
  readonly journeyType?: JourneyType | string;
  readonly strategy?: JourneyCompositionStrategy | string;
  readonly context?: JourneyCompositionContext;
  readonly travellerRequirements?: JourneyTravellerRequirements;
  readonly destinationRequirements?: JourneyDestinationRequirements;
  readonly stayRequirements?: JourneyStayRequirements;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function isValidIntegerAtLeast(value: unknown, minimum: number): boolean {
  return typeof value === "number" && Number.isInteger(value) && value >= minimum;
}

function isEnumValue<T extends Record<string, string>>(value: unknown, enumeration: T): value is T[keyof T] {
  return typeof value === "string" && Object.values(enumeration).includes(value as T[keyof T]);
}

function createError(code: JourneyValidationErrorCode, message: string): JourneyValidationError {
  return Object.freeze({ code, message });
}

function isValidTravellerRequirements(requirements: unknown): boolean {
  if (!isObject(requirements)) {
    return false;
  }

  const travellerRequirements = requirements as JourneyTravellerRequirements;

  if (!isValidIntegerAtLeast(travellerRequirements.minimumTravellers, 1)) {
    return false;
  }

  if (!isValidIntegerAtLeast(travellerRequirements.maximumTravellers, travellerRequirements.minimumTravellers ?? 1)) {
    return false;
  }

  if (typeof travellerRequirements.privateOnly !== "undefined" && typeof travellerRequirements.privateOnly !== "boolean") {
    return false;
  }

  if (typeof travellerRequirements.ageRestriction !== "undefined" && isBlank(travellerRequirements.ageRestriction)) {
    return false;
  }

  return true;
}

function isValidDuration(duration: unknown): boolean {
  if (!isObject(duration)) {
    return false;
  }

  const journeyDuration = duration as JourneyDuration;

  if (!isValidIntegerAtLeast(journeyDuration.days, 1)) {
    return false;
  }

  if (!isValidIntegerAtLeast(journeyDuration.nights, 0)) {
    return false;
  }

  if (typeof journeyDuration.description !== "undefined" && isBlank(journeyDuration.description)) {
    return false;
  }

  return (journeyDuration.nights as number) <= (journeyDuration.days as number);
}

export class JourneyQueryValidator {
  public validate(query: JourneyCompositionQuery | null | undefined): JourneyValidationResult {
    const errors: JourneyValidationError[] = [];

    if (!isObject(query)) {
      errors.push(createError(JourneyValidationErrorCode.INVALID_QUERY, "Journey request is required."));
      return createJourneyValidationResult(errors);
    }

    const request = query as JourneyCompositionQuery;

    if (!isObject(request.context) || isBlank(request.context.requestId) || !isEnumValue(request.context.source, JourneyCompositionSource) || !isValidDate(request.context.timestamp)) {
      errors.push(createError(JourneyValidationErrorCode.MISSING_CONTEXT, "Journey context is required."));
    }

    if (!isEnumValue(request.journeyType, JourneyType)) {
      errors.push(createError(JourneyValidationErrorCode.INVALID_JOURNEY_TYPE, "Journey type is invalid."));
    }

    if (!isEnumValue(request.strategy, JourneyCompositionStrategy)) {
      errors.push(createError(JourneyValidationErrorCode.INVALID_STRATEGY, "Composition strategy is invalid."));
    }

    if (!isValidTravellerRequirements(request.travellerRequirements)) {
      errors.push(createError(JourneyValidationErrorCode.INVALID_TRAVELLER_RULES, "Traveller requirements are invalid."));
    }

    if (!isValidDuration(request.stayRequirements?.duration)) {
      errors.push(createError(JourneyValidationErrorCode.INVALID_DURATION, "Stay requirements are invalid."));
    }

    return createJourneyValidationResult(errors);
  }
}
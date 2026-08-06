import { JourneyValidationError } from "./journey-validation-error";

export interface JourneyValidationResult {
  readonly valid: boolean;
  readonly errors: ReadonlyArray<JourneyValidationError>;
}

export function createJourneyValidationResult(
  errors: ReadonlyArray<JourneyValidationError>,
): JourneyValidationResult {
  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze([...errors]),
  });
}
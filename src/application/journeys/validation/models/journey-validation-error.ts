import { JourneyValidationErrorCode } from "./journey-validation-error-code";

export interface JourneyValidationError {
  readonly code: JourneyValidationErrorCode;
  readonly message: string;
}
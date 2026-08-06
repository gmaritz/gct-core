import { AccommodationValidationErrorCode } from "./accommodation-validation-error-code";

export interface AccommodationValidationError {
  readonly code: AccommodationValidationErrorCode;
  readonly field: string;
  readonly message: string;
}
import { AccommodationValidationError } from "./accommodation-validation-error";

export interface AccommodationValidationResult {
  readonly valid: boolean;
  readonly errors: ReadonlyArray<AccommodationValidationError>;
}
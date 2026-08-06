import { AccommodationContentValidationError } from "./accommodation-content-validation-error";

export interface AccommodationContentValidationResult {
  readonly valid: boolean;
  readonly errors: ReadonlyArray<AccommodationContentValidationError>;
}
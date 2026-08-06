import { AccommodationRateValidationError } from "./accommodation-rate-validation-error";

export interface AccommodationRateValidationResult {
  readonly valid: boolean;
  readonly errors: ReadonlyArray<AccommodationRateValidationError>;
}
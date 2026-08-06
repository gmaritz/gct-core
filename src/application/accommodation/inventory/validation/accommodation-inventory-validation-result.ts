import { AccommodationInventoryValidationError } from "./accommodation-inventory-validation-error";

export interface AccommodationInventoryValidationResult {
  readonly valid: boolean;
  readonly errors: ReadonlyArray<AccommodationInventoryValidationError>;
}
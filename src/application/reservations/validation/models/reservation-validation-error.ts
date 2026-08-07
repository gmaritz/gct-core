import { ReservationValidationErrorCode } from "./reservation-validation-error-code";

export interface ReservationValidationError {
  readonly code: ReservationValidationErrorCode;
  readonly message: string;
}

import {
  createPaymentValidationError,
  createPaymentValidationResult,
  PaymentValidationErrorCode,
  PaymentValidationResult,
  PaymentValidationStage,
} from "../models";
import { PaymentValidationRequest } from "./payment-request-validator";

export class ReservationValidator {
  public validate(request: PaymentValidationRequest): PaymentValidationResult {
    const errors = [];

    if (!request.reservationContext?.exists) {
      errors.push(
        createPaymentValidationError({
          stage: PaymentValidationStage.RESERVATION,
          code: PaymentValidationErrorCode.MISSING_RESERVATION,
          message: "Reservation is required.",
          severity: "CRITICAL",
        }),
      );
    }

    if (request.reservationContext?.status === "CANCELLED") {
      errors.push(
        createPaymentValidationError({
          stage: PaymentValidationStage.RESERVATION,
          code: PaymentValidationErrorCode.RESERVATION_CANCELLED,
          message: "Reservation is cancelled and cannot be paid.",
          severity: "CRITICAL",
        }),
      );
    }

    if (request.reservationContext?.payable === false) {
      errors.push(
        createPaymentValidationError({
          stage: PaymentValidationStage.RESERVATION,
          code: PaymentValidationErrorCode.RESERVATION_NOT_PAYABLE,
          message: "Reservation is not payable.",
          severity: "CRITICAL",
        }),
      );
    }

    return createPaymentValidationResult({
      stage: PaymentValidationStage.RESERVATION,
      errors,
      metadata: {
        validatedAt: new Date(),
        version: "1.0.0",
        source: "ReservationValidator",
      },
    });
  }
}

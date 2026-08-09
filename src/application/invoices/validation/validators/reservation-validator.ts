import {
  createInvoiceValidationError,
  createInvoiceValidationResult,
  InvoiceValidationErrorCode,
  InvoiceValidationResult,
  InvoiceValidationStage,
} from "../models";
import { InvoiceValidationRequest } from "./invoice-request-validator";

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

const reservationReadyStatuses = new Set<string>(["CONFIRMED", "AMENDED"]);

export class ReservationValidator {
  public validate(request: InvoiceValidationRequest): InvoiceValidationResult {
    const errors = [];

    if (request.reservationContext?.exists === false) {
      errors.push(
        createInvoiceValidationError({
          stage: InvoiceValidationStage.RESERVATION,
          code: InvoiceValidationErrorCode.MISSING_RESERVATION,
          message: "Reservation is required.",
          severity: "CRITICAL",
        }),
      );
    }

    if (request.reservationContext?.status === "CANCELLED") {
      errors.push(
        createInvoiceValidationError({
          stage: InvoiceValidationStage.RESERVATION,
          code: InvoiceValidationErrorCode.RESERVATION_CANCELLED,
          message: "Reservation is cancelled and not valid for invoice processing.",
          severity: "CRITICAL",
        }),
      );
    }

    if (
      request.reservationContext?.exists === true
      && !isBlank(request.reservationContext.status)
      && !reservationReadyStatuses.has(request.reservationContext.status!.trim())
      && request.reservationContext.status !== "CANCELLED"
    ) {
      errors.push(
        createInvoiceValidationError({
          stage: InvoiceValidationStage.RESERVATION,
          code: InvoiceValidationErrorCode.RESERVATION_NOT_CONFIRMED,
          message: "Reservation is not in a confirmed state for invoice processing.",
          severity: "CRITICAL",
        }),
      );
    }

    const reservationId = request.reservationReference?.reservationId ?? request.invoice?.reservationReference.reservationId;
    const contextReservationId = request.reservationContext?.reservationId;
    if (!isBlank(reservationId) && !isBlank(contextReservationId) && reservationId !== contextReservationId) {
      errors.push(
        createInvoiceValidationError({
          stage: InvoiceValidationStage.RESERVATION,
          code: InvoiceValidationErrorCode.MISSING_RESERVATION_REFERENCE,
          message: "Invoice reservation reference is inconsistent with reservation context.",
          severity: "CRITICAL",
        }),
      );
    }

    return createInvoiceValidationResult({
      stage: InvoiceValidationStage.RESERVATION,
      errors,
      metadata: {
        validatedAt: new Date(),
        version: "1.0.0",
        source: "ReservationValidator",
      },
    });
  }
}
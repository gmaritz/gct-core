import {
  PaymentMetadata,
  PaymentMethod,
  PaymentPricingSnapshot,
  PaymentReference,
  PaymentStatus,
  PaymentReservationSnapshot,
  PaymentProviderReference,
} from "../../models";
import {
  createPaymentValidationError,
  createPaymentValidationResult,
  PaymentValidationErrorCode,
  PaymentValidationResult,
  PaymentValidationStage,
} from "../models";

export interface PaymentGatewayContext {
  readonly providerReference?: PaymentProviderReference | null;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly paymentContextId?: string;
}

export interface PaymentReservationContext {
  readonly exists?: boolean;
  readonly status?: string;
  readonly payable?: boolean;
}

export interface PaymentValidationRequest {
  readonly reference?: PaymentReference | null;
  readonly reservationSnapshot?: PaymentReservationSnapshot | null;
  readonly pricingSnapshot?: PaymentPricingSnapshot | null;
  readonly paymentAmount?: number | null;
  readonly currency?: string | null;
  readonly paymentMethod?: PaymentMethod | null;
  readonly status?: PaymentStatus | null;
  readonly metadata?: PaymentMetadata | null;
  readonly reservationContext?: PaymentReservationContext | null;
  readonly gatewayContext?: PaymentGatewayContext | null;
}

function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

export class PaymentRequestValidator {
  public validate(request: PaymentValidationRequest | null | undefined): PaymentValidationResult {
    const errors = [];

    if (!request) {
      errors.push(
        createPaymentValidationError({
          stage: PaymentValidationStage.REQUEST,
          code: PaymentValidationErrorCode.MISSING_REQUEST,
          message: "Payment request is required.",
          severity: "CRITICAL",
        }),
      );

      return createPaymentValidationResult({
        stage: PaymentValidationStage.REQUEST,
        errors,
        metadata: {
          validatedAt: new Date(),
          version: "1.0.0",
          source: "PaymentRequestValidator",
        },
      });
    }

    if (isBlank(request.reference?.paymentId)) {
      errors.push(
        createPaymentValidationError({
          stage: PaymentValidationStage.REQUEST,
          code: PaymentValidationErrorCode.MISSING_PAYMENT_IDENTIFIER,
          message: "Payment identifier is required.",
          severity: "CRITICAL",
        }),
      );
    }

    if (typeof request.paymentMethod === "undefined" || request.paymentMethod === null) {
      errors.push(
        createPaymentValidationError({
          stage: PaymentValidationStage.REQUEST,
          code: PaymentValidationErrorCode.MISSING_PAYMENT_METHOD,
          message: "Payment method is required.",
          severity: "CRITICAL",
        }),
      );
    }

    if (isBlank(request.currency)) {
      errors.push(
        createPaymentValidationError({
          stage: PaymentValidationStage.REQUEST,
          code: PaymentValidationErrorCode.MISSING_CURRENCY,
          message: "Payment currency is required.",
          severity: "CRITICAL",
        }),
      );
    }

    if (isBlank(request.reservationSnapshot?.reservationReference)) {
      errors.push(
        createPaymentValidationError({
          stage: PaymentValidationStage.REQUEST,
          code: PaymentValidationErrorCode.MISSING_RESERVATION_REFERENCE,
          message: "Reservation reference is required.",
          severity: "CRITICAL",
        }),
      );
    }

    return createPaymentValidationResult({
      stage: PaymentValidationStage.REQUEST,
      errors,
      metadata: {
        validatedAt: new Date(),
        version: "1.0.0",
        source: "PaymentRequestValidator",
      },
    });
  }
}

import {
  createPaymentValidationError,
  createPaymentValidationResult,
  PaymentValidationErrorCode,
  PaymentValidationResult,
  PaymentValidationStage,
} from "../models";
import { PaymentValidationRequest } from "./payment-request-validator";

export class PricingValidator {
  public validate(request: PaymentValidationRequest): PaymentValidationResult {
    const errors = [];

    if (!request.pricingSnapshot) {
      errors.push(
        createPaymentValidationError({
          stage: PaymentValidationStage.PRICING,
          code: PaymentValidationErrorCode.MISSING_PRICING_SNAPSHOT,
          message: "Pricing snapshot is required.",
          severity: "CRITICAL",
        }),
      );

      return createPaymentValidationResult({
        stage: PaymentValidationStage.PRICING,
        errors,
        metadata: {
          validatedAt: new Date(),
          version: "1.0.0",
          source: "PricingValidator",
        },
      });
    }

    if (request.pricingSnapshot.total <= 0) {
      errors.push(
        createPaymentValidationError({
          stage: PaymentValidationStage.PRICING,
          code: PaymentValidationErrorCode.INVALID_PRICING_TOTAL,
          message: "Pricing total must be greater than zero.",
          severity: "CRITICAL",
        }),
      );
    }

    if (typeof request.paymentAmount !== "number" || request.paymentAmount <= 0) {
      errors.push(
        createPaymentValidationError({
          stage: PaymentValidationStage.PRICING,
          code: PaymentValidationErrorCode.INVALID_PAYABLE_AMOUNT,
          message: "Payable amount must be greater than zero.",
          severity: "CRITICAL",
        }),
      );
    }

    if (request.currency && request.pricingSnapshot.currency !== request.currency) {
      errors.push(
        createPaymentValidationError({
          stage: PaymentValidationStage.PRICING,
          code: PaymentValidationErrorCode.CURRENCY_MISMATCH,
          message: "Payment currency must match pricing currency.",
          severity: "CRITICAL",
        }),
      );
    }

    return createPaymentValidationResult({
      stage: PaymentValidationStage.PRICING,
      errors,
      metadata: {
        validatedAt: new Date(),
        version: "1.0.0",
        source: "PricingValidator",
      },
    });
  }
}

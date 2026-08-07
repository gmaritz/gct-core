import { PaymentMethod, PaymentStatus } from "../../models";
import {
  createPaymentValidationError,
  createPaymentValidationResult,
  PaymentValidationErrorCode,
  PaymentValidationResult,
  PaymentValidationStage,
} from "../models";
import { PaymentValidationRequest } from "./payment-request-validator";

const SUPPORTED_METHODS = new Set<PaymentMethod>([
  PaymentMethod.CARD,
  PaymentMethod.EFT,
  PaymentMethod.INSTANT_PAYMENT,
  PaymentMethod.WALLET,
  PaymentMethod.BANK_TRANSFER,
]);

const SUPPORTED_CURRENCIES = new Set(["ZAR", "USD", "EUR", "GBP"]);

const SUPPORTED_STATES = new Set<PaymentStatus>([
  PaymentStatus.CREATED,
  PaymentStatus.AUTHORIZATION_REQUESTED,
  PaymentStatus.AUTHORIZED,
]);

export class SettlementReadinessValidator {
  public validate(request: PaymentValidationRequest): PaymentValidationResult {
    const errors = [];

    if (!request.paymentMethod || !SUPPORTED_METHODS.has(request.paymentMethod)) {
      errors.push(
        createPaymentValidationError({
          stage: PaymentValidationStage.SETTLEMENT_READINESS,
          code: PaymentValidationErrorCode.UNSUPPORTED_PAYMENT_METHOD,
          message: "Payment method is not supported for settlement.",
          severity: "CRITICAL",
        }),
      );
    }

    if (!request.currency || !SUPPORTED_CURRENCIES.has(request.currency)) {
      errors.push(
        createPaymentValidationError({
          stage: PaymentValidationStage.SETTLEMENT_READINESS,
          code: PaymentValidationErrorCode.UNSUPPORTED_CURRENCY,
          message: "Currency is not supported for settlement.",
          severity: "CRITICAL",
        }),
      );
    }

    if (
      request.pricingSnapshot &&
      typeof request.paymentAmount === "number" &&
      request.paymentAmount !== request.pricingSnapshot.total
    ) {
      errors.push(
        createPaymentValidationError({
          stage: PaymentValidationStage.SETTLEMENT_READINESS,
          code: PaymentValidationErrorCode.AMOUNT_INCONSISTENT,
          message: "Payment amount must equal pricing total.",
          severity: "CRITICAL",
        }),
      );
    }

    if (!request.metadata?.version || !request.metadata.source) {
      errors.push(
        createPaymentValidationError({
          stage: PaymentValidationStage.SETTLEMENT_READINESS,
          code: PaymentValidationErrorCode.INVALID_SETTLEMENT_METADATA,
          message: "Settlement metadata is incomplete.",
          severity: "CRITICAL",
        }),
      );
    }

    if (!request.status || !SUPPORTED_STATES.has(request.status)) {
      errors.push(
        createPaymentValidationError({
          stage: PaymentValidationStage.SETTLEMENT_READINESS,
          code: PaymentValidationErrorCode.INVALID_PAYMENT_LIFECYCLE_STATE,
          message: "Payment lifecycle state is not settlement-ready.",
          severity: "CRITICAL",
        }),
      );
    }

    return createPaymentValidationResult({
      stage: PaymentValidationStage.SETTLEMENT_READINESS,
      errors,
      metadata: {
        validatedAt: new Date(),
        version: "1.0.0",
        source: "SettlementReadinessValidator",
      },
    });
  }
}

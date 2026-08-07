import {
  createPaymentValidationError,
  createPaymentValidationResult,
  PaymentValidationErrorCode,
  PaymentValidationResult,
  PaymentValidationStage,
} from "../models";
import { PaymentValidationRequest } from "./payment-request-validator";

export class GatewayReadinessValidator {
  public validate(request: PaymentValidationRequest): PaymentValidationResult {
    const errors = [];

    if (!request.gatewayContext) {
      errors.push(
        createPaymentValidationError({
          stage: PaymentValidationStage.GATEWAY_READINESS,
          code: PaymentValidationErrorCode.INCOMPLETE_GATEWAY_CONTEXT,
          message: "Gateway context is required.",
          severity: "CRITICAL",
        }),
      );
    }

    if (!request.gatewayContext?.providerReference?.reference) {
      errors.push(
        createPaymentValidationError({
          stage: PaymentValidationStage.GATEWAY_READINESS,
          code: PaymentValidationErrorCode.MISSING_PROVIDER_REFERENCE,
          message: "Provider reference is required for gateway readiness.",
          severity: "CRITICAL",
        }),
      );
    }

    if (!request.gatewayContext?.correlationId || !request.gatewayContext.requestId) {
      errors.push(
        createPaymentValidationError({
          stage: PaymentValidationStage.GATEWAY_READINESS,
          code: PaymentValidationErrorCode.MISSING_CORRELATION_IDENTIFIERS,
          message: "Correlation identifiers are required.",
          severity: "CRITICAL",
        }),
      );
    }

    if (!request.gatewayContext?.paymentContextId || !request.reference?.paymentId) {
      errors.push(
        createPaymentValidationError({
          stage: PaymentValidationStage.GATEWAY_READINESS,
          code: PaymentValidationErrorCode.MISSING_PAYMENT_CONTEXT,
          message: "Payment context is incomplete.",
          severity: "CRITICAL",
        }),
      );
    }

    return createPaymentValidationResult({
      stage: PaymentValidationStage.GATEWAY_READINESS,
      errors,
      metadata: {
        validatedAt: new Date(),
        version: "1.0.0",
        source: "GatewayReadinessValidator",
      },
    });
  }
}

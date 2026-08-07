import { PaymentValidationErrorCode } from "./payment-validation-error-code";
import { PaymentValidationStage } from "./payment-validation-stage";

export type PaymentValidationSeverity = "CRITICAL" | "WARNING";

export interface PaymentValidationError {
  readonly stage: PaymentValidationStage;
  readonly code: PaymentValidationErrorCode;
  readonly message: string;
  readonly severity: PaymentValidationSeverity;
}

export function createPaymentValidationError(error: PaymentValidationError): PaymentValidationError {
  return Object.freeze({
    stage: error.stage,
    code: error.code,
    message: error.message,
    severity: error.severity,
  });
}

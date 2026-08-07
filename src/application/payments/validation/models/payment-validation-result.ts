import { createPaymentValidationError, PaymentValidationError } from "./payment-validation-error";
import { PaymentValidationStage } from "./payment-validation-stage";

export interface PaymentValidationResultMetadata {
  readonly validatedAt: Date;
  readonly version: string;
  readonly source: string;
}

export interface PaymentValidationResult {
  readonly success: boolean;
  readonly stage: PaymentValidationStage;
  readonly errors: ReadonlyArray<PaymentValidationError>;
  readonly warnings: ReadonlyArray<string>;
  readonly metadata: PaymentValidationResultMetadata;
}

export function createPaymentValidationResult(input: {
  readonly stage: PaymentValidationStage;
  readonly errors?: ReadonlyArray<PaymentValidationError>;
  readonly warnings?: ReadonlyArray<string>;
  readonly metadata: PaymentValidationResultMetadata;
}): PaymentValidationResult {
  const errors = Object.freeze([...(input.errors ?? []).map(createPaymentValidationError)]);
  const warnings = Object.freeze([...(input.warnings ?? [])]);

  return Object.freeze({
    success: errors.length === 0,
    stage: input.stage,
    errors,
    warnings,
    metadata: Object.freeze({
      validatedAt: new Date(input.metadata.validatedAt.getTime()),
      version: input.metadata.version,
      source: input.metadata.source,
    }),
  });
}

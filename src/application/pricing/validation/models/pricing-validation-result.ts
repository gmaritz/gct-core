import { PricingValidationError, createPricingValidationError } from "./pricing-validation-error";
import { PricingValidationStage } from "./pricing-validation-stage";

export interface PricingValidationResultMetadata {
  readonly validatedAt: Date;
  readonly version: string;
  readonly source: string;
}

export interface PricingValidationResult {
  readonly valid: boolean;
  readonly stage: PricingValidationStage;
  readonly errors: ReadonlyArray<PricingValidationError>;
  readonly warnings: ReadonlyArray<string>;
  readonly metadata: PricingValidationResultMetadata;
}

export function createPricingValidationResult(input: {
  readonly stage: PricingValidationStage;
  readonly errors?: ReadonlyArray<PricingValidationError>;
  readonly warnings?: ReadonlyArray<string>;
  readonly metadata: PricingValidationResultMetadata;
}): PricingValidationResult {
  const errors = Object.freeze([...(input.errors ?? []).map(createPricingValidationError)]);
  const warnings = Object.freeze([...(input.warnings ?? [])]);

  return Object.freeze({
    valid: errors.length === 0,
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

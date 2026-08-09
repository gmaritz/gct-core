import { createInvoiceValidationError, InvoiceValidationError } from "./invoice-validation-error";
import { InvoiceValidationStage } from "./invoice-validation-stage";

export interface InvoiceValidationResultMetadata {
  readonly validatedAt: Date;
  readonly version: string;
  readonly source: string;
}

export interface InvoiceValidationResult {
  readonly success: boolean;
  readonly stage: InvoiceValidationStage;
  readonly errors: ReadonlyArray<InvoiceValidationError>;
  readonly warnings: ReadonlyArray<string>;
  readonly metadata: InvoiceValidationResultMetadata;
}

export function createInvoiceValidationResult(input: {
  readonly stage: InvoiceValidationStage;
  readonly errors?: ReadonlyArray<InvoiceValidationError>;
  readonly warnings?: ReadonlyArray<string>;
  readonly metadata: InvoiceValidationResultMetadata;
}): InvoiceValidationResult {
  const errors = Object.freeze([...(input.errors ?? []).map(createInvoiceValidationError)]);
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
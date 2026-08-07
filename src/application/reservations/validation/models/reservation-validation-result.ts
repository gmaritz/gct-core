import { CommercialIntegrityFinding } from "./commercial-integrity-finding";
import { ReservationValidationError } from "./reservation-validation-error";
import { ReservationValidationWarning } from "./reservation-validation-warning";

export interface ReservationValidationMetadata {
  readonly validatedAt: Date;
  readonly version: string;
  readonly source: string;
}

export interface ReservationValidationResult {
  readonly valid: boolean;
  readonly errors: ReadonlyArray<ReservationValidationError>;
  readonly warnings: ReadonlyArray<ReservationValidationWarning>;
  readonly integrityFindings: ReadonlyArray<CommercialIntegrityFinding>;
  readonly metadata: ReservationValidationMetadata;
}

export function createReservationValidationResult(input: {
  readonly errors?: ReadonlyArray<ReservationValidationError>;
  readonly warnings?: ReadonlyArray<ReservationValidationWarning>;
  readonly integrityFindings?: ReadonlyArray<CommercialIntegrityFinding>;
  readonly metadata: ReservationValidationMetadata;
}): ReservationValidationResult {
  const errors = Object.freeze([...(input.errors ?? [])]);
  const warnings = Object.freeze([...(input.warnings ?? [])]);
  const integrityFindings = Object.freeze([...(input.integrityFindings ?? [])]);

  return Object.freeze({
    valid: errors.length === 0,
    errors,
    warnings,
    integrityFindings,
    metadata: Object.freeze({
      validatedAt: new Date(input.metadata.validatedAt.getTime()),
      version: input.metadata.version,
      source: input.metadata.source,
    }),
  });
}

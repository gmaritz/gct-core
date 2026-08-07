import { ReservationPolicyOutcome } from "./reservation-policy-outcome";
import { ReservationPolicyPriority } from "./reservation-policy-priority";

export interface ReservationPolicyResultMetadata {
  readonly evaluatedAt: Date;
  readonly version: string;
  readonly source: string;
}

export interface ReservationPolicyResult {
  readonly permitted: boolean;
  readonly outcome: ReservationPolicyOutcome;
  readonly priority: ReservationPolicyPriority;
  readonly errors: ReadonlyArray<string>;
  readonly warnings: ReadonlyArray<string>;
  readonly observations: ReadonlyArray<string>;
  readonly metadata: ReservationPolicyResultMetadata;
}

export function createReservationPolicyResult(input: {
  readonly permitted: boolean;
  readonly outcome: ReservationPolicyOutcome;
  readonly priority: ReservationPolicyPriority;
  readonly errors?: ReadonlyArray<string>;
  readonly warnings?: ReadonlyArray<string>;
  readonly observations?: ReadonlyArray<string>;
  readonly metadata: ReservationPolicyResultMetadata;
}): ReservationPolicyResult {
  return Object.freeze({
    permitted: input.permitted,
    outcome: input.outcome,
    priority: input.priority,
    errors: Object.freeze([...(input.errors ?? [])]),
    warnings: Object.freeze([...(input.warnings ?? [])]),
    observations: Object.freeze([...(input.observations ?? [])]),
    metadata: Object.freeze({
      evaluatedAt: new Date(input.metadata.evaluatedAt.getTime()),
      version: input.metadata.version,
      source: input.metadata.source,
    }),
  });
}

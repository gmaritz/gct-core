import { Reservation } from "../../aggregate";

export interface ReservationBuildResultMetadata {
  readonly builtAt: Date;
  readonly version: string;
  readonly source: string;
}

export interface ReservationBuildResult {
  readonly successful: boolean;
  readonly reservation: Reservation | null;
  readonly errors: ReadonlyArray<string>;
  readonly warnings: ReadonlyArray<string>;
  readonly metadata: ReservationBuildResultMetadata;
}

export function createReservationBuildResult(input: {
  readonly successful: boolean;
  readonly reservation?: Reservation | null;
  readonly errors?: ReadonlyArray<string>;
  readonly warnings?: ReadonlyArray<string>;
  readonly metadata: ReservationBuildResultMetadata;
}): ReservationBuildResult {
  return Object.freeze({
    successful: input.successful,
    reservation: input.reservation ?? null,
    errors: Object.freeze([...(input.errors ?? [])]),
    warnings: Object.freeze([...(input.warnings ?? [])]),
    metadata: Object.freeze({
      builtAt: new Date(input.metadata.builtAt.getTime()),
      version: input.metadata.version,
      source: input.metadata.source,
    }),
  });
}

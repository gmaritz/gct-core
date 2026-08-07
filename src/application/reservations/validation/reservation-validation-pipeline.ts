import { Reservation } from "../aggregate";
import { ReservationSnapshotSet, ReservationSnapshotValidator } from "./reservation-snapshot-validator";
import { ReservationQuery, ReservationQueryValidator } from "./reservation-query-validator";
import { CommercialIntegrityValidator } from "./commercial-integrity-validator";
import { createReservationValidationResult, ReservationValidationResult } from "./models";

export interface ReservationValidationPipelineDependencies {
  readonly queryValidator: ReservationQueryValidator;
  readonly snapshotValidator: ReservationSnapshotValidator;
  readonly integrityValidator: CommercialIntegrityValidator;
}

export interface ReservationValidationPipelineInput {
  readonly query: ReservationQuery;
  readonly snapshots: ReservationSnapshotSet;
  readonly reservation?: Reservation | null;
}

export class ReservationValidationPipeline {
  public constructor(private readonly dependencies: ReservationValidationPipelineDependencies) {}

  public execute(input: ReservationValidationPipelineInput): ReservationValidationResult {
    const queryResult = this.dependencies.queryValidator.validate(input.query);
    if (!queryResult.valid) {
      return queryResult;
    }

    const snapshotResult = this.dependencies.snapshotValidator.validate(input.snapshots);
    if (!snapshotResult.valid) {
      return snapshotResult;
    }

    if (typeof input.reservation === "undefined" || input.reservation === null) {
      return createReservationValidationResult({
        errors: [],
        warnings: [],
        integrityFindings: [],
        metadata: {
          validatedAt: new Date(),
          version: "1.0.0",
          source: "ReservationValidationPipeline",
        },
      });
    }

    const integrityResult = this.dependencies.integrityValidator.validate({ reservation: input.reservation });

    return createReservationValidationResult({
      errors: [],
      warnings: [...queryResult.warnings, ...snapshotResult.warnings, ...integrityResult.warnings],
      integrityFindings: [...queryResult.integrityFindings, ...snapshotResult.integrityFindings, ...integrityResult.integrityFindings],
      metadata: {
        validatedAt: new Date(),
        version: "1.0.0",
        source: "ReservationValidationPipeline",
      },
    });
  }
}

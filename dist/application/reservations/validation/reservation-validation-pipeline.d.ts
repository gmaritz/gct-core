import { Reservation } from "../aggregate";
import { ReservationSnapshotSet, ReservationSnapshotValidator } from "./reservation-snapshot-validator";
import { ReservationQuery, ReservationQueryValidator } from "./reservation-query-validator";
import { CommercialIntegrityValidator } from "./commercial-integrity-validator";
import { ReservationValidationResult } from "./models";
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
export declare class ReservationValidationPipeline {
    private readonly dependencies;
    constructor(dependencies: ReservationValidationPipelineDependencies);
    execute(input: ReservationValidationPipelineInput): ReservationValidationResult;
}
//# sourceMappingURL=reservation-validation-pipeline.d.ts.map
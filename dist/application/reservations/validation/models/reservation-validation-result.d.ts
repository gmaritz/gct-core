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
export declare function createReservationValidationResult(input: {
    readonly errors?: ReadonlyArray<ReservationValidationError>;
    readonly warnings?: ReadonlyArray<ReservationValidationWarning>;
    readonly integrityFindings?: ReadonlyArray<CommercialIntegrityFinding>;
    readonly metadata: ReservationValidationMetadata;
}): ReservationValidationResult;
//# sourceMappingURL=reservation-validation-result.d.ts.map
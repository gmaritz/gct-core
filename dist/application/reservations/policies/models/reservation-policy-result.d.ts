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
export declare function createReservationPolicyResult(input: {
    readonly permitted: boolean;
    readonly outcome: ReservationPolicyOutcome;
    readonly priority: ReservationPolicyPriority;
    readonly errors?: ReadonlyArray<string>;
    readonly warnings?: ReadonlyArray<string>;
    readonly observations?: ReadonlyArray<string>;
    readonly metadata: ReservationPolicyResultMetadata;
}): ReservationPolicyResult;
//# sourceMappingURL=reservation-policy-result.d.ts.map
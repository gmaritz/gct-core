import { Reservation } from "../../aggregate";
import { ReservationPolicyResult } from "../../policies";
import { ReservationQuery } from "../../validation";
import { ReservationMetadata, ReservationTimeline } from "../../models";
import { ReservationSnapshotSet } from "../../validation";
export interface ReservationBuilderContext {
    readonly validatedRequest: ReservationQuery;
    readonly reservationNumber: string;
    readonly snapshots: ReservationSnapshotSet;
    readonly approvedPolicyResult: ReservationPolicyResult;
    readonly metadata: ReservationMetadata;
    readonly timelineSeed: ReservationTimeline;
    readonly reservation?: Reservation | null;
}
//# sourceMappingURL=reservation-builder-context.d.ts.map
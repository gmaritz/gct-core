import { Reservation } from "../../aggregate";
import { ReservationBuildResult } from "../../builder";
import { ReservationMetadata, ReservationTimeline } from "../../models";
import { ReservationPolicyResult } from "../../policies";
import { ReservationQuery, ReservationSnapshotSet, ReservationValidationResult } from "../../validation";
export interface ReservationServiceRequest {
    readonly query: ReservationQuery;
    readonly snapshots: ReservationSnapshotSet;
    readonly metadata: ReservationMetadata;
    readonly timelineSeed: ReservationTimeline;
    readonly reservation?: Reservation | null;
}
export interface ReservationServiceContextMetadata {
    readonly createdAt: Date;
    readonly version: string;
    readonly requestId: string;
}
export interface ReservationServiceContext {
    readonly reservationRequest: ReservationServiceRequest;
    readonly validationResult?: ReservationValidationResult;
    readonly policyResult?: ReservationPolicyResult;
    readonly builderResult?: ReservationBuildResult;
    readonly reservation?: Reservation | null;
    readonly metadata: ReservationServiceContextMetadata;
}
export declare function createReservationServiceContext(request: ReservationServiceRequest): ReservationServiceContext;
export declare function withValidationResult(context: ReservationServiceContext, validationResult: ReservationValidationResult): ReservationServiceContext;
export declare function withPolicyResult(context: ReservationServiceContext, policyResult: ReservationPolicyResult): ReservationServiceContext;
export declare function withBuilderResult(context: ReservationServiceContext, builderResult: ReservationBuildResult): ReservationServiceContext;
//# sourceMappingURL=reservation-service-context.d.ts.map
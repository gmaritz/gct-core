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

function cloneDate(value: Date): Date {
  return new Date(value.getTime());
}

export function createReservationServiceContext(request: ReservationServiceRequest): ReservationServiceContext {
  return Object.freeze({
    reservationRequest: request,
    metadata: Object.freeze({
      createdAt: new Date(),
      version: "1.0.0",
      requestId: request.query.requestId,
    }),
  });
}

export function withValidationResult(
  context: ReservationServiceContext,
  validationResult: ReservationValidationResult,
): ReservationServiceContext {
  return Object.freeze({
    ...context,
    validationResult,
    metadata: Object.freeze({
      createdAt: cloneDate(context.metadata.createdAt),
      version: context.metadata.version,
      requestId: context.metadata.requestId,
    }),
  });
}

export function withPolicyResult(
  context: ReservationServiceContext,
  policyResult: ReservationPolicyResult,
): ReservationServiceContext {
  return Object.freeze({
    ...context,
    policyResult,
    metadata: Object.freeze({
      createdAt: cloneDate(context.metadata.createdAt),
      version: context.metadata.version,
      requestId: context.metadata.requestId,
    }),
  });
}

export function withBuilderResult(
  context: ReservationServiceContext,
  builderResult: ReservationBuildResult,
): ReservationServiceContext {
  return Object.freeze({
    ...context,
    builderResult,
    reservation: builderResult.reservation,
    metadata: Object.freeze({
      createdAt: cloneDate(context.metadata.createdAt),
      version: context.metadata.version,
      requestId: context.metadata.requestId,
    }),
  });
}

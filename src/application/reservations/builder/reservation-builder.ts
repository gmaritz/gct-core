import { Reservation, ReservationComposition, ReservationStatus } from "../aggregate";
import { ReservationPolicyResult } from "../policies";
import { ReservationTimeline } from "../models";
import { ReservationBuilderContext } from "./models";
import { ReservationBuildResult, createReservationBuildResult } from "./models";

export interface ReservationAggregateValidationResult {
  readonly valid: boolean;
  readonly errors: ReadonlyArray<string>;
  readonly warnings: ReadonlyArray<string>;
}

export interface ReservationAggregateValidator {
  validate(reservation: Reservation): ReservationAggregateValidationResult;
}

function cloneDate(value: Date): Date {
  return new Date(value.getTime());
}

function cloneTimeline(timeline: ReservationTimeline): ReservationTimeline {
  return Object.freeze(
    timeline.map((entry: ReservationTimeline[number]) =>
      Object.freeze({
        snapshotId: entry.snapshotId,
        capturedAt: cloneDate(entry.capturedAt),
        version: entry.version,
        milestone: entry.milestone,
        occurredAt: cloneDate(entry.occurredAt),
        note: entry.note,
      }),
    ),
  );
}

function ensurePolicyAllowed(policyResult: ReservationPolicyResult): boolean {
  return policyResult.permitted && policyResult.outcome !== "DENY";
}

function createComposition(context: ReservationBuilderContext): ReservationComposition {
  return {
    identity: Object.freeze({
      id: context.validatedRequest.requestId,
    }),
    status: ReservationStatus.CREATED,
    journeySnapshot: context.snapshots.journeySnapshot!,
    travellerSnapshots: context.snapshots.travellerSnapshots ?? Object.freeze([]),
    accommodationSnapshots: context.snapshots.accommodationSnapshots,
    pricingSnapshot: context.snapshots.pricingSnapshot,
    paymentSnapshot: context.snapshots.paymentSnapshot,
    timeline: cloneTimeline(context.timelineSeed),
    metadata: Object.freeze({
      createdAt: cloneDate(context.metadata.createdAt),
      updatedAt: cloneDate(context.metadata.updatedAt),
      version: context.metadata.version,
    }),
  };
}

export class ReservationBuilder {
  public constructor(private readonly aggregateValidator: ReservationAggregateValidator) {}

  public build(context: ReservationBuilderContext): ReservationBuildResult {
    if (!ensurePolicyAllowed(context.approvedPolicyResult)) {
      return createReservationBuildResult({
        successful: false,
        errors: [...context.approvedPolicyResult.errors],
        warnings: [...context.approvedPolicyResult.warnings],
        metadata: {
          builtAt: new Date(),
          version: "1.0.0",
          source: "ReservationBuilder",
        },
      });
    }

    let reservation: Reservation;

    try {
      reservation = Reservation.create(createComposition(context));
    } catch (error) {
      return createReservationBuildResult({
        successful: false,
        errors: [error instanceof Error ? error.message : "Reservation construction failed."],
        warnings: [...context.approvedPolicyResult.warnings],
        metadata: {
          builtAt: new Date(),
          version: "1.0.0",
          source: "ReservationBuilder",
        },
      });
    }

    const aggregateValidation = this.aggregateValidator.validate(reservation);

    if (!aggregateValidation.valid) {
      return createReservationBuildResult({
        successful: false,
        errors: [...aggregateValidation.errors],
        warnings: [...context.approvedPolicyResult.warnings, ...aggregateValidation.warnings],
        metadata: {
          builtAt: new Date(),
          version: "1.0.0",
          source: "ReservationBuilder",
        },
      });
    }

    return createReservationBuildResult({
      successful: true,
      reservation,
      warnings: [...context.approvedPolicyResult.warnings, ...aggregateValidation.warnings],
      metadata: {
        builtAt: new Date(),
        version: "1.0.0",
        source: "ReservationBuilder",
      },
    });
  }
}

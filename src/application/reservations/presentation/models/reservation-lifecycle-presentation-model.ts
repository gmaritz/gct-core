import { ReservationStatus } from "../../aggregate";
import { ReservationTimelineMilestone } from "../../models";

export interface ReservationTimelinePresentationEntry {
  readonly milestone: ReservationTimelineMilestone;
  readonly occurredAt: Date;
  readonly note?: string;
}

export interface ReservationBookingProgressPresentation {
  readonly stage: string;
  readonly percentage: number;
}

export interface ReservationPaymentProgressPresentation {
  readonly paidAmount: number;
  readonly outstandingAmount: number;
  readonly complete: boolean;
}

export interface ReservationLifecyclePresentationMetadata {
  readonly generatedAt: Date;
  readonly version: string;
  readonly requestId: string;
}

export interface ReservationLifecyclePresentationModel {
  readonly status: ReservationStatus;
  readonly bookingProgress: ReservationBookingProgressPresentation;
  readonly paymentProgress: ReservationPaymentProgressPresentation;
  readonly outstandingActions: ReadonlyArray<string>;
  readonly timelineSummary: ReadonlyArray<ReservationTimelinePresentationEntry>;
  readonly nextRecommendedAction: string;
  readonly metadata: ReservationLifecyclePresentationMetadata;
}

function cloneDate(value: Date): Date {
  return new Date(value.getTime());
}

function freezeBookingProgress(
  progress: ReservationBookingProgressPresentation,
): ReservationBookingProgressPresentation {
  return Object.freeze({
    stage: progress.stage,
    percentage: progress.percentage,
  });
}

function freezePaymentProgress(
  progress: ReservationPaymentProgressPresentation,
): ReservationPaymentProgressPresentation {
  return Object.freeze({
    paidAmount: progress.paidAmount,
    outstandingAmount: progress.outstandingAmount,
    complete: progress.complete,
  });
}

function freezeTimelineEntry(
  entry: ReservationTimelinePresentationEntry,
): ReservationTimelinePresentationEntry {
  return Object.freeze({
    milestone: entry.milestone,
    occurredAt: cloneDate(entry.occurredAt),
    note: entry.note,
  });
}

export function createReservationLifecyclePresentationModel(
  model: ReservationLifecyclePresentationModel,
): ReservationLifecyclePresentationModel {
  return Object.freeze({
    status: model.status,
    bookingProgress: freezeBookingProgress(model.bookingProgress),
    paymentProgress: freezePaymentProgress(model.paymentProgress),
    outstandingActions: Object.freeze([...model.outstandingActions]),
    timelineSummary: Object.freeze(model.timelineSummary.map(freezeTimelineEntry)),
    nextRecommendedAction: model.nextRecommendedAction,
    metadata: Object.freeze({
      generatedAt: cloneDate(model.metadata.generatedAt),
      version: model.metadata.version,
      requestId: model.metadata.requestId,
    }),
  });
}

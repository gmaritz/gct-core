import { ReservationSnapshot } from "./reservation-snapshot";

export enum ReservationTimelineMilestone {
  CREATED = "CREATED",
  QUOTED = "QUOTED",
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  AMENDED = "AMENDED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export interface ReservationTimelineEntry extends ReservationSnapshot {
  readonly milestone: ReservationTimelineMilestone;
  readonly occurredAt: Date;
  readonly note?: string;
}

export type ReservationTimeline = ReadonlyArray<ReservationTimelineEntry>;

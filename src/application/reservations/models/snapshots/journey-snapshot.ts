import { ReservationSnapshot } from "./reservation-snapshot";

export interface JourneySnapshot extends ReservationSnapshot {
  readonly journeyId: string;
  readonly title: string;
  readonly destination?: string;
  readonly duration?: string;
  readonly accommodationSummary?: string;
  readonly experienceSummary?: string;
  readonly startDate?: Date;
  readonly endDate?: Date;
  readonly summary?: string;
}

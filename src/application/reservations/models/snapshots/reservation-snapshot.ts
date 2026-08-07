export interface ReservationSnapshot {
  readonly snapshotId: string;
  readonly capturedAt: Date;
  readonly version: string;
}

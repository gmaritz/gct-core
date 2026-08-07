import { Reservation } from "../../aggregate";
import { ReservationSnapshotSet } from "../../validation";
import { ReservationValidationResult } from "../../validation";

export interface ReservationPolicyContext {
  readonly validationResult: ReservationValidationResult;
  readonly snapshots: ReservationSnapshotSet;
  readonly reservation?: Reservation | null;
}

import { ReservationPolicy } from "./reservation-policy";
import { ReservationPolicyContext } from "./models";
import { ReservationPolicyResult } from "./models";

export interface ReservationCancellationPolicy extends ReservationPolicy<ReservationPolicyContext, ReservationPolicyResult> {}

import { ReservationPolicy } from "./reservation-policy";
import { ReservationPolicyContext } from "./models";
import { ReservationPolicyResult } from "./models";

export interface ReservationEligibilityPolicy extends ReservationPolicy<ReservationPolicyContext, ReservationPolicyResult> {}

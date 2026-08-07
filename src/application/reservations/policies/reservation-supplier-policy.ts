import { ReservationPolicy } from "./reservation-policy";
import { ReservationPolicyContext } from "./models";
import { ReservationPolicyResult } from "./models";

export interface ReservationSupplierPolicy extends ReservationPolicy<ReservationPolicyContext, ReservationPolicyResult> {}

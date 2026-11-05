import { Reservation } from "../reservations/aggregate";
import { PaymentAttempt } from "./payment-attempt";
export type VerifiedPayFastPaymentStatus = "COMPLETE" | "CANCELLED";
export declare function transitionReservationFromVerifiedPayFastNotification(reservation: Reservation, attempt: PaymentAttempt, providerStatus: VerifiedPayFastPaymentStatus, verifiedGrossAmount: string, occurredAt?: Date): Reservation;
//# sourceMappingURL=verified-payfast-notification-transition.d.ts.map
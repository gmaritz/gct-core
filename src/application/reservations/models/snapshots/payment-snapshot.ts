import { ReservationSnapshot } from "./reservation-snapshot";

export interface PaymentSnapshot extends ReservationSnapshot {
  readonly paymentStatus: string;
  readonly paymentMethod?: string;
  readonly amountReceived: number;
  readonly balanceOutstanding: number;
}

import { ReservationSnapshot } from "./reservation-snapshot";

export interface PricingSnapshot extends ReservationSnapshot {
  readonly currency: string;
  readonly totalPrice: number;
  readonly taxes: number;
  readonly discounts: number;
  readonly fees: number;
}

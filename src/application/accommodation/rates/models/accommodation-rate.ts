import { AccommodationCurrency } from "./accommodation-currency";
import { AccommodationRateStatus } from "./accommodation-rate-status";
import { AccommodationRateType } from "./accommodation-rate-type";

export interface AccommodationRate {
  readonly id: string;
  readonly type: AccommodationRateType;
  readonly status: AccommodationRateStatus;
  readonly currency: AccommodationCurrency;
  readonly amount: number;
  readonly boardCode?: string;
  readonly boardName?: string;
}
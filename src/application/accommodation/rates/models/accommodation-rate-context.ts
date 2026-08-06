import { AccommodationCurrency } from "./accommodation-currency";
import { AccommodationRateSource } from "./accommodation-rate-source";

export interface AccommodationRateContext {
  readonly requestId: string;
  readonly source: AccommodationRateSource;
  readonly currency: AccommodationCurrency;
  readonly market: string;
  readonly timestamp: Date;
}
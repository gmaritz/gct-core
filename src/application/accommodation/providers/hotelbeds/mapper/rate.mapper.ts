import { HotelbedsRate } from "../models";

export function mapHotelbedsRate(rate: HotelbedsRate): HotelbedsRate {
  return {
    ...rate,
    cancellationPolicies: rate.cancellationPolicies ? [...rate.cancellationPolicies] : undefined,
    promotions: rate.promotions ? [...rate.promotions] : undefined,
    offers: rate.offers ? [...rate.offers] : undefined,
    shiftRates: rate.shiftRates ? [...rate.shiftRates] : undefined,
    dailyRates: rate.dailyRates ? [...rate.dailyRates] : undefined,
    taxes: rate.taxes
      ? {
          ...rate.taxes,
          taxes: rate.taxes.taxes ? [...rate.taxes.taxes] : undefined,
        }
      : undefined,
  };
}

export function mapHotelbedsRates(rates: ReadonlyArray<HotelbedsRate> = []): ReadonlyArray<HotelbedsRate> {
  return rates.map(mapHotelbedsRate);
}
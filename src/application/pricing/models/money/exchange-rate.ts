import { Currency } from "./currency";

export interface ExchangeRate {
  readonly baseCurrency: Currency;
  readonly quoteCurrency: Currency;
  readonly rate: number;
  readonly effectiveAt: Date;
  readonly source: string;
}

export function createExchangeRate(rate: ExchangeRate): ExchangeRate {
  return Object.freeze({
    baseCurrency: rate.baseCurrency,
    quoteCurrency: rate.quoteCurrency,
    rate: rate.rate,
    effectiveAt: new Date(rate.effectiveAt.getTime()),
    source: rate.source,
  });
}

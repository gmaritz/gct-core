import { Currency } from "./currency";
export interface ExchangeRate {
    readonly baseCurrency: Currency;
    readonly quoteCurrency: Currency;
    readonly rate: number;
    readonly effectiveAt: Date;
    readonly source: string;
}
export declare function createExchangeRate(rate: ExchangeRate): ExchangeRate;
//# sourceMappingURL=exchange-rate.d.ts.map
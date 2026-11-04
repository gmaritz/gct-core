import { Currency } from "../models";
export declare const STRICT_SAME_CURRENCY_POLICY_ID = "STRICT_SAME_CURRENCY";
export declare const FIXED_RATE_POLICY_ID = "CONFIGURED_FIXED_RATE";
export declare const ACCOMMODATION_CURRENCY_POLICY_ENV = "ACCOMMODATION_CURRENCY_POLICY";
export declare const ACCOMMODATION_FIXED_RATE_EUR_ZAR_ENV = "ACCOMMODATION_FIXED_RATE_EUR_ZAR";
export declare class AccommodationCurrencyPolicyError extends Error {
    constructor(message: string);
}
export interface AccommodationFixedRate {
    readonly from: Currency;
    readonly to: Currency;
    readonly rate: number;
}
export interface AccommodationCurrencyPolicy {
    readonly policyId: string;
    readonly fixedRates: ReadonlyArray<AccommodationFixedRate>;
}
export declare const STRICT_SAME_CURRENCY_POLICY: AccommodationCurrencyPolicy;
export declare function createFixedRatePolicy(rates: ReadonlyArray<AccommodationFixedRate>): AccommodationCurrencyPolicy;
export declare function loadAccommodationCurrencyPolicy(env?: Readonly<Record<string, string | undefined>>): AccommodationCurrencyPolicy;
export declare function findFixedRate(policy: AccommodationCurrencyPolicy, from: Currency, to: Currency): AccommodationFixedRate | undefined;
//# sourceMappingURL=accommodation-currency-policy.d.ts.map
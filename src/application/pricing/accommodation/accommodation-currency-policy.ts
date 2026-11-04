import { Currency } from "../models";

export const STRICT_SAME_CURRENCY_POLICY_ID = "STRICT_SAME_CURRENCY";
export const FIXED_RATE_POLICY_ID = "CONFIGURED_FIXED_RATE";

export const ACCOMMODATION_CURRENCY_POLICY_ENV = "ACCOMMODATION_CURRENCY_POLICY";
export const ACCOMMODATION_FIXED_RATE_EUR_ZAR_ENV = "ACCOMMODATION_FIXED_RATE_EUR_ZAR";

export class AccommodationCurrencyPolicyError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "AccommodationCurrencyPolicyError";
  }
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

export const STRICT_SAME_CURRENCY_POLICY: AccommodationCurrencyPolicy = Object.freeze({
  policyId: STRICT_SAME_CURRENCY_POLICY_ID,
  fixedRates: Object.freeze([]),
});

export function createFixedRatePolicy(rates: ReadonlyArray<AccommodationFixedRate>): AccommodationCurrencyPolicy {
  rates.forEach((entry) => {
    if (!Number.isFinite(entry.rate) || entry.rate <= 0) {
      throw new AccommodationCurrencyPolicyError(`Fixed rate ${entry.from}/${entry.to} must be a positive finite number.`);
    }
  });
  return Object.freeze({ policyId: FIXED_RATE_POLICY_ID, fixedRates: Object.freeze([...rates].map((entry) => Object.freeze({ ...entry }))) });
}

// No default rate exists: fixed-rate mode requires every rate to be configured explicitly.
export function loadAccommodationCurrencyPolicy(
  env: Readonly<Record<string, string | undefined>> = process.env,
): AccommodationCurrencyPolicy {
  const mode = (env[ACCOMMODATION_CURRENCY_POLICY_ENV] ?? "").trim().toUpperCase() || STRICT_SAME_CURRENCY_POLICY_ID;
  if (mode === STRICT_SAME_CURRENCY_POLICY_ID) return STRICT_SAME_CURRENCY_POLICY;
  if (mode !== "FIXED_RATE") {
    throw new AccommodationCurrencyPolicyError(`Unsupported ${ACCOMMODATION_CURRENCY_POLICY_ENV} value.`);
  }

  const raw = env[ACCOMMODATION_FIXED_RATE_EUR_ZAR_ENV]?.trim();
  if (!raw || !/^\d+(\.\d+)?$/.test(raw)) {
    throw new AccommodationCurrencyPolicyError(`${ACCOMMODATION_FIXED_RATE_EUR_ZAR_ENV} must be configured as a positive decimal rate.`);
  }
  return createFixedRatePolicy([{ from: Currency.EUR, to: Currency.ZAR, rate: Number(raw) }]);
}

export function findFixedRate(
  policy: AccommodationCurrencyPolicy,
  from: Currency,
  to: Currency,
): AccommodationFixedRate | undefined {
  return policy.fixedRates.find((entry) => entry.from === from && entry.to === to);
}

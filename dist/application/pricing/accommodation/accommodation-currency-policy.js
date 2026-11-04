"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STRICT_SAME_CURRENCY_POLICY = exports.AccommodationCurrencyPolicyError = exports.ACCOMMODATION_FIXED_RATE_EUR_ZAR_ENV = exports.ACCOMMODATION_CURRENCY_POLICY_ENV = exports.FIXED_RATE_POLICY_ID = exports.STRICT_SAME_CURRENCY_POLICY_ID = void 0;
exports.createFixedRatePolicy = createFixedRatePolicy;
exports.loadAccommodationCurrencyPolicy = loadAccommodationCurrencyPolicy;
exports.findFixedRate = findFixedRate;
const models_1 = require("../models");
exports.STRICT_SAME_CURRENCY_POLICY_ID = "STRICT_SAME_CURRENCY";
exports.FIXED_RATE_POLICY_ID = "CONFIGURED_FIXED_RATE";
exports.ACCOMMODATION_CURRENCY_POLICY_ENV = "ACCOMMODATION_CURRENCY_POLICY";
exports.ACCOMMODATION_FIXED_RATE_EUR_ZAR_ENV = "ACCOMMODATION_FIXED_RATE_EUR_ZAR";
class AccommodationCurrencyPolicyError extends Error {
    constructor(message) {
        super(message);
        this.name = "AccommodationCurrencyPolicyError";
    }
}
exports.AccommodationCurrencyPolicyError = AccommodationCurrencyPolicyError;
exports.STRICT_SAME_CURRENCY_POLICY = Object.freeze({
    policyId: exports.STRICT_SAME_CURRENCY_POLICY_ID,
    fixedRates: Object.freeze([]),
});
function createFixedRatePolicy(rates) {
    rates.forEach((entry) => {
        if (!Number.isFinite(entry.rate) || entry.rate <= 0) {
            throw new AccommodationCurrencyPolicyError(`Fixed rate ${entry.from}/${entry.to} must be a positive finite number.`);
        }
    });
    return Object.freeze({ policyId: exports.FIXED_RATE_POLICY_ID, fixedRates: Object.freeze([...rates].map((entry) => Object.freeze({ ...entry }))) });
}
// No default rate exists: fixed-rate mode requires every rate to be configured explicitly.
function loadAccommodationCurrencyPolicy(env = process.env) {
    const mode = (env[exports.ACCOMMODATION_CURRENCY_POLICY_ENV] ?? "").trim().toUpperCase() || exports.STRICT_SAME_CURRENCY_POLICY_ID;
    if (mode === exports.STRICT_SAME_CURRENCY_POLICY_ID)
        return exports.STRICT_SAME_CURRENCY_POLICY;
    if (mode !== "FIXED_RATE") {
        throw new AccommodationCurrencyPolicyError(`Unsupported ${exports.ACCOMMODATION_CURRENCY_POLICY_ENV} value.`);
    }
    const raw = env[exports.ACCOMMODATION_FIXED_RATE_EUR_ZAR_ENV]?.trim();
    if (!raw || !/^\d+(\.\d+)?$/.test(raw)) {
        throw new AccommodationCurrencyPolicyError(`${exports.ACCOMMODATION_FIXED_RATE_EUR_ZAR_ENV} must be configured as a positive decimal rate.`);
    }
    return createFixedRatePolicy([{ from: models_1.Currency.EUR, to: models_1.Currency.ZAR, rate: Number(raw) }]);
}
function findFixedRate(policy, from, to) {
    return policy.fixedRates.find((entry) => entry.from === from && entry.to === to);
}
//# sourceMappingURL=accommodation-currency-policy.js.map
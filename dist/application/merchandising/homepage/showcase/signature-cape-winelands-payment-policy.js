"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICIES = exports.SignatureCapeWinelandsPaymentPolicyResolutionError = exports.SIGNATURE_CAPE_WINELANDS_LEAD_TIME_THRESHOLD_DAYS = exports.SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICY_VERSION = exports.SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICY_SCOPE = exports.SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICY_ID = void 0;
exports.resolveSignatureCapeWinelandsPaymentPolicy = resolveSignatureCapeWinelandsPaymentPolicy;
const calendar_date_1 = require("./calendar-date");
const cape_winelands_journey_resolver_1 = require("./cape-winelands-journey-resolver");
exports.SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICY_ID = "SIGNATURE_CAPE_WINELANDS_INITIAL_PAYMENT";
exports.SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICY_SCOPE = "SIGNATURE_CAPE_WINELANDS_MULTI_DAY_PACKAGE";
exports.SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICY_VERSION = "1.0.0";
exports.SIGNATURE_CAPE_WINELANDS_LEAD_TIME_THRESHOLD_DAYS = 14;
class SignatureCapeWinelandsPaymentPolicyResolutionError extends Error {
    constructor(message) {
        super(message);
        this.name = "SignatureCapeWinelandsPaymentPolicyResolutionError";
    }
}
exports.SignatureCapeWinelandsPaymentPolicyResolutionError = SignatureCapeWinelandsPaymentPolicyResolutionError;
function fail(message) {
    throw new SignatureCapeWinelandsPaymentPolicyResolutionError(message);
}
function validateRate(value) {
    if (!/^\d+(?:\.\d+)?$/.test(value))
        fail("GCT collection rate must be a decimal value from 0 through 1.");
    const [whole, fraction = ""] = value.split(".");
    if (BigInt(`${whole}${fraction}`) > 10n ** BigInt(fraction.length)) {
        fail("GCT collection rate must be a decimal value from 0 through 1.");
    }
}
function validateRecord(record) {
    if (!record
        || typeof record.policyId !== "string"
        || !/^[A-Z][A-Z0-9_]*$/.test(record.policyId)
        || typeof record.version !== "string"
        || !/^\d+\.\d+\.\d+$/.test(record.version)
        || typeof record.journeyId !== "string"
        || typeof record.scope !== "string"
        || typeof record.effectiveFrom !== "string"
        || typeof record.gctCollectionRate !== "string"
        || !Number.isInteger(record.leadTimeThresholdDays)
        || typeof record.commercialTimeZone !== "string"
        || (record.status !== "ACTIVE" && record.status !== "INACTIVE")) {
        fail("Commercial payment policy identity or parameters are invalid.");
    }
    if (record.scope !== exports.SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICY_SCOPE) {
        fail(`Unsupported Signature Cape Winelands payment policy scope: ${record.scope}.`);
    }
    if (record.leadTimeThresholdDays !== exports.SIGNATURE_CAPE_WINELANDS_LEAD_TIME_THRESHOLD_DAYS) {
        fail(`The Signature Cape Winelands policy threshold must be ${exports.SIGNATURE_CAPE_WINELANDS_LEAD_TIME_THRESHOLD_DAYS} calendar days.`);
    }
    if (record.commercialTimeZone !== calendar_date_1.SIGNATURE_CAPE_WINELANDS_COMMERCIAL_TIME_ZONE) {
        fail(`The Signature Cape Winelands policy timezone must be ${calendar_date_1.SIGNATURE_CAPE_WINELANDS_COMMERCIAL_TIME_ZONE}.`);
    }
    const effectiveFrom = (0, calendar_date_1.parseCalendarDate)(record.effectiveFrom, "Policy effective-from date");
    if (record.effectiveTo !== undefined) {
        const effectiveTo = (0, calendar_date_1.parseCalendarDate)(record.effectiveTo, "Policy effective-to date");
        if (effectiveTo < effectiveFrom)
            fail("Policy effective-to date must not precede its effective-from date.");
    }
    validateRate(record.gctCollectionRate);
}
const initialPolicy = Object.freeze({
    policyId: exports.SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICY_ID,
    version: exports.SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICY_VERSION,
    journeyId: cape_winelands_journey_resolver_1.CAPE_WINELANDS_JOURNEY_ID,
    scope: exports.SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICY_SCOPE,
    effectiveFrom: "2026-11-17",
    gctCollectionRate: "0.50",
    leadTimeThresholdDays: exports.SIGNATURE_CAPE_WINELANDS_LEAD_TIME_THRESHOLD_DAYS,
    commercialTimeZone: calendar_date_1.SIGNATURE_CAPE_WINELANDS_COMMERCIAL_TIME_ZONE,
    status: "ACTIVE",
});
exports.SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICIES = Object.freeze([
    initialPolicy,
]);
function createEffectivePeriods(records) {
    for (const record of records)
        validateRecord(record);
    const sorted = [...records].sort((left, right) => left.effectiveFrom.localeCompare(right.effectiveFrom));
    const versions = new Set();
    const starts = new Set();
    const policyIds = new Set();
    for (const record of sorted) {
        if (versions.has(record.version))
            fail(`Duplicate commercial payment policy version ${record.version}.`);
        if (starts.has(record.effectiveFrom))
            fail(`Multiple commercial payment policy versions start on ${record.effectiveFrom}.`);
        versions.add(record.version);
        starts.add(record.effectiveFrom);
        policyIds.add(record.policyId);
    }
    if (policyIds.size !== 1)
        fail("Commercial payment policy versions must retain one stable policy identifier.");
    return Object.freeze(sorted.map((record, index) => {
        const next = sorted[index + 1];
        const nextStart = next ? (0, calendar_date_1.parseCalendarDate)(next.effectiveFrom, "Policy effective-from date") : undefined;
        const explicitEnd = record.effectiveTo
            ? (0, calendar_date_1.parseCalendarDate)(record.effectiveTo, "Policy effective-to date")
            : undefined;
        if (nextStart && explicitEnd && explicitEnd >= nextStart) {
            fail(`Commercial payment policy effective periods overlap at ${nextStart}.`);
        }
        return Object.freeze({
            record,
            effectiveFrom: (0, calendar_date_1.parseCalendarDate)(record.effectiveFrom, "Policy effective-from date"),
            effectiveTo: explicitEnd ?? (nextStart ? (0, calendar_date_1.subtractCalendarDays)(nextStart, 1) : undefined),
        });
    }));
}
function resolveSignatureCapeWinelandsPaymentPolicy(journeyId, bookingDate, records = exports.SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICIES) {
    if (journeyId !== cape_winelands_journey_resolver_1.CAPE_WINELANDS_JOURNEY_ID)
        fail(`Unsupported payment policy journey identity: ${journeyId}.`);
    if (!Array.isArray(records))
        fail("Commercial payment policy records must be an array.");
    const applicableRecords = records.filter((record) => record?.journeyId === journeyId);
    if (applicableRecords.length === 0)
        fail("No Signature Cape Winelands commercial payment policy is configured.");
    if (applicableRecords.some((record) => !record || record.scope !== exports.SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICY_SCOPE)) {
        fail("Unsupported Signature Cape Winelands payment policy scope.");
    }
    const bookingCalendarDate = (0, calendar_date_1.calendarDateInTimeZone)(bookingDate, calendar_date_1.SIGNATURE_CAPE_WINELANDS_COMMERCIAL_TIME_ZONE, "Booking date");
    const periods = createEffectivePeriods(applicableRecords);
    const matches = periods.filter((period) => period.effectiveFrom <= bookingCalendarDate
        && (period.effectiveTo === undefined || bookingCalendarDate <= period.effectiveTo));
    if (matches.length === 0)
        fail(`No Signature Cape Winelands policy is effective on ${bookingCalendarDate}.`);
    if (matches.length !== 1)
        fail(`Multiple Signature Cape Winelands policies are effective on ${bookingCalendarDate}.`);
    const match = matches[0];
    if (match.record.status !== "ACTIVE")
        fail(`Signature Cape Winelands policy ${match.record.version} is inactive.`);
    return Object.freeze({
        ...match.record,
        journeyId: cape_winelands_journey_resolver_1.CAPE_WINELANDS_JOURNEY_ID,
        scope: exports.SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICY_SCOPE,
        status: "ACTIVE",
        commercialTimeZone: calendar_date_1.SIGNATURE_CAPE_WINELANDS_COMMERCIAL_TIME_ZONE,
        leadTimeThresholdDays: exports.SIGNATURE_CAPE_WINELANDS_LEAD_TIME_THRESHOLD_DAYS,
        effectiveFrom: match.effectiveFrom,
        effectiveTo: match.effectiveTo,
    });
}
//# sourceMappingURL=signature-cape-winelands-payment-policy.js.map
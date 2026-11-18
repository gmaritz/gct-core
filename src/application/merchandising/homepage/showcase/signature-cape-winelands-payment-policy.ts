import {
  calendarDateInTimeZone,
  parseCalendarDate,
  SIGNATURE_CAPE_WINELANDS_COMMERCIAL_TIME_ZONE,
  subtractCalendarDays,
} from "./calendar-date";
import { CAPE_WINELANDS_JOURNEY_ID } from "./cape-winelands-journey-resolver";

export const SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICY_ID = "SIGNATURE_CAPE_WINELANDS_INITIAL_PAYMENT";
export const SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICY_SCOPE = "SIGNATURE_CAPE_WINELANDS_MULTI_DAY_PACKAGE";
export const SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICY_VERSION = "1.0.0";
export const SIGNATURE_CAPE_WINELANDS_LEAD_TIME_THRESHOLD_DAYS = 14;

export type SignatureCapeWinelandsPaymentPolicyStatus = "ACTIVE" | "INACTIVE";

export interface SignatureCapeWinelandsPaymentPolicyRecord {
  readonly policyId: string;
  readonly version: string;
  readonly journeyId: string;
  readonly scope: string;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
  readonly gctCollectionRate: string;
  readonly leadTimeThresholdDays: number;
  readonly commercialTimeZone: string;
  readonly status: SignatureCapeWinelandsPaymentPolicyStatus;
}

export interface ResolvedSignatureCapeWinelandsPaymentPolicy
  extends Omit<SignatureCapeWinelandsPaymentPolicyRecord, "journeyId" | "scope" | "status" | "commercialTimeZone" | "leadTimeThresholdDays"> {
  readonly journeyId: typeof CAPE_WINELANDS_JOURNEY_ID;
  readonly scope: typeof SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICY_SCOPE;
  readonly status: "ACTIVE";
  readonly commercialTimeZone: typeof SIGNATURE_CAPE_WINELANDS_COMMERCIAL_TIME_ZONE;
  readonly leadTimeThresholdDays: typeof SIGNATURE_CAPE_WINELANDS_LEAD_TIME_THRESHOLD_DAYS;
}

export class SignatureCapeWinelandsPaymentPolicyResolutionError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "SignatureCapeWinelandsPaymentPolicyResolutionError";
  }
}

function fail(message: string): never {
  throw new SignatureCapeWinelandsPaymentPolicyResolutionError(message);
}

function validateRate(value: string): void {
  if (!/^\d+(?:\.\d+)?$/.test(value)) fail("GCT collection rate must be a decimal value from 0 through 1.");
  const [whole, fraction = ""] = value.split(".");
  if (BigInt(`${whole}${fraction}`) > 10n ** BigInt(fraction.length)) {
    fail("GCT collection rate must be a decimal value from 0 through 1.");
  }
}

function validateRecord(record: SignatureCapeWinelandsPaymentPolicyRecord): void {
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
  if (record.scope !== SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICY_SCOPE) {
    fail(`Unsupported Signature Cape Winelands payment policy scope: ${record.scope}.`);
  }
  if (record.leadTimeThresholdDays !== SIGNATURE_CAPE_WINELANDS_LEAD_TIME_THRESHOLD_DAYS) {
    fail(`The Signature Cape Winelands policy threshold must be ${SIGNATURE_CAPE_WINELANDS_LEAD_TIME_THRESHOLD_DAYS} calendar days.`);
  }
  if (record.commercialTimeZone !== SIGNATURE_CAPE_WINELANDS_COMMERCIAL_TIME_ZONE) {
    fail(`The Signature Cape Winelands policy timezone must be ${SIGNATURE_CAPE_WINELANDS_COMMERCIAL_TIME_ZONE}.`);
  }
  const effectiveFrom = parseCalendarDate(record.effectiveFrom, "Policy effective-from date");
  if (record.effectiveTo !== undefined) {
    const effectiveTo = parseCalendarDate(record.effectiveTo, "Policy effective-to date");
    if (effectiveTo < effectiveFrom) fail("Policy effective-to date must not precede its effective-from date.");
  }
  validateRate(record.gctCollectionRate);
}

const initialPolicy: SignatureCapeWinelandsPaymentPolicyRecord = Object.freeze({
  policyId: SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICY_ID,
  version: SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICY_VERSION,
  journeyId: CAPE_WINELANDS_JOURNEY_ID,
  scope: SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICY_SCOPE,
  effectiveFrom: "2026-11-17",
  gctCollectionRate: "0.50",
  leadTimeThresholdDays: SIGNATURE_CAPE_WINELANDS_LEAD_TIME_THRESHOLD_DAYS,
  commercialTimeZone: SIGNATURE_CAPE_WINELANDS_COMMERCIAL_TIME_ZONE,
  status: "ACTIVE",
});

export const SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICIES: ReadonlyArray<SignatureCapeWinelandsPaymentPolicyRecord> = Object.freeze([
  initialPolicy,
]);

interface EffectivePolicyPeriod {
  readonly record: SignatureCapeWinelandsPaymentPolicyRecord;
  readonly effectiveFrom: string;
  readonly effectiveTo?: string;
}

function createEffectivePeriods(
  records: ReadonlyArray<SignatureCapeWinelandsPaymentPolicyRecord>,
): ReadonlyArray<EffectivePolicyPeriod> {
  for (const record of records) validateRecord(record);
  const sorted = [...records].sort((left, right) => left.effectiveFrom.localeCompare(right.effectiveFrom));
  const versions = new Set<string>();
  const starts = new Set<string>();
  const policyIds = new Set<string>();

  for (const record of sorted) {
    if (versions.has(record.version)) fail(`Duplicate commercial payment policy version ${record.version}.`);
    if (starts.has(record.effectiveFrom)) fail(`Multiple commercial payment policy versions start on ${record.effectiveFrom}.`);
    versions.add(record.version);
    starts.add(record.effectiveFrom);
    policyIds.add(record.policyId);
  }
  if (policyIds.size !== 1) fail("Commercial payment policy versions must retain one stable policy identifier.");

  return Object.freeze(sorted.map((record, index) => {
    const next = sorted[index + 1];
    const nextStart = next ? parseCalendarDate(next.effectiveFrom, "Policy effective-from date") : undefined;
    const explicitEnd = record.effectiveTo
      ? parseCalendarDate(record.effectiveTo, "Policy effective-to date")
      : undefined;
    if (nextStart && explicitEnd && explicitEnd >= nextStart) {
      fail(`Commercial payment policy effective periods overlap at ${nextStart}.`);
    }
    return Object.freeze({
      record,
      effectiveFrom: parseCalendarDate(record.effectiveFrom, "Policy effective-from date"),
      effectiveTo: explicitEnd ?? (nextStart ? subtractCalendarDays(nextStart, 1) : undefined),
    });
  }));
}

export function resolveSignatureCapeWinelandsPaymentPolicy(
  journeyId: string,
  bookingDate: Date,
  records: ReadonlyArray<SignatureCapeWinelandsPaymentPolicyRecord> = SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICIES,
): ResolvedSignatureCapeWinelandsPaymentPolicy {
  if (journeyId !== CAPE_WINELANDS_JOURNEY_ID) fail(`Unsupported payment policy journey identity: ${journeyId}.`);
  if (!Array.isArray(records)) fail("Commercial payment policy records must be an array.");

  const applicableRecords = records.filter((record) => record?.journeyId === journeyId);
  if (applicableRecords.length === 0) fail("No Signature Cape Winelands commercial payment policy is configured.");
  if (applicableRecords.some((record) => !record || record.scope !== SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICY_SCOPE)) {
    fail("Unsupported Signature Cape Winelands payment policy scope.");
  }

  const bookingCalendarDate = calendarDateInTimeZone(
    bookingDate,
    SIGNATURE_CAPE_WINELANDS_COMMERCIAL_TIME_ZONE,
    "Booking date",
  );
  const periods = createEffectivePeriods(applicableRecords);
  const matches = periods.filter((period) =>
    period.effectiveFrom <= bookingCalendarDate
    && (period.effectiveTo === undefined || bookingCalendarDate <= period.effectiveTo),
  );
  if (matches.length === 0) fail(`No Signature Cape Winelands policy is effective on ${bookingCalendarDate}.`);
  if (matches.length !== 1) fail(`Multiple Signature Cape Winelands policies are effective on ${bookingCalendarDate}.`);

  const match = matches[0]!;
  if (match.record.status !== "ACTIVE") fail(`Signature Cape Winelands policy ${match.record.version} is inactive.`);
  return Object.freeze({
    ...match.record,
    journeyId: CAPE_WINELANDS_JOURNEY_ID,
    scope: SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICY_SCOPE,
    status: "ACTIVE",
    commercialTimeZone: SIGNATURE_CAPE_WINELANDS_COMMERCIAL_TIME_ZONE,
    leadTimeThresholdDays: SIGNATURE_CAPE_WINELANDS_LEAD_TIME_THRESHOLD_DAYS,
    effectiveFrom: match.effectiveFrom,
    effectiveTo: match.effectiveTo,
  });
}

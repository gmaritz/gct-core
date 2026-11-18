import { CAPE_WINELANDS_JOURNEY_ID } from "./cape-winelands-journey-resolver";
import {
  resolveSignatureCapeWinelandsPaymentPolicy,
  ResolvedSignatureCapeWinelandsPaymentPolicy,
  SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICIES,
  SignatureCapeWinelandsPaymentPolicyRecord,
} from "./signature-cape-winelands-payment-policy";

const currentPolicy = SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICIES[0]!;

function policyRecord(overrides: Partial<SignatureCapeWinelandsPaymentPolicyRecord> = {}): SignatureCapeWinelandsPaymentPolicyRecord {
  return { ...currentPolicy, ...overrides };
}

function resolve(
  bookingDate: string,
  records: ReadonlyArray<SignatureCapeWinelandsPaymentPolicyRecord> = [currentPolicy],
): ResolvedSignatureCapeWinelandsPaymentPolicy {
  return resolveSignatureCapeWinelandsPaymentPolicy(
    CAPE_WINELANDS_JOURNEY_ID,
    new Date(`${bookingDate}T10:00:00.000Z`),
    records,
  );
}

describe("resolveSignatureCapeWinelandsPaymentPolicy", () => {
  it("resolves the active, approved policy and its complete commercial parameters", () => {
    expect(resolve("2026-11-17")).toMatchObject({
      policyId: "SIGNATURE_CAPE_WINELANDS_INITIAL_PAYMENT",
      version: "1.0.0",
      journeyId: CAPE_WINELANDS_JOURNEY_ID,
      scope: "SIGNATURE_CAPE_WINELANDS_MULTI_DAY_PACKAGE",
      effectiveFrom: "2026-11-17",
      effectiveTo: undefined,
      gctCollectionRate: "0.50",
      leadTimeThresholdDays: 14,
      commercialTimeZone: "Africa/Johannesburg",
      status: "ACTIVE",
    });
  });

  it("uses Johannesburg calendar dates for the effective-from boundary", () => {
    const beforeMidnightUtc = new Date("2026-11-16T21:59:59.999Z");
    const atMidnightJohannesburg = new Date("2026-11-16T22:00:00.000Z");

    expect(() => resolveSignatureCapeWinelandsPaymentPolicy(CAPE_WINELANDS_JOURNEY_ID, beforeMidnightUtc))
      .toThrow("No Signature Cape Winelands policy is effective");
    expect(resolveSignatureCapeWinelandsPaymentPolicy(CAPE_WINELANDS_JOURNEY_ID, atMidnightJohannesburg).effectiveFrom)
      .toBe("2026-11-17");
  });

  it("selects successive versions by booking date while preserving historical records", () => {
    const historical = Object.freeze(policyRecord({ effectiveTo: "2026-12-31" }));
    const newer = Object.freeze(policyRecord({
      version: "1.1.0",
      effectiveFrom: "2027-01-01",
      effectiveTo: undefined,
      gctCollectionRate: "0.60",
    }));
    const records = Object.freeze([historical, newer]);

    expect(resolve("2026-12-31", records)).toMatchObject({ version: "1.0.0", effectiveTo: "2026-12-31" });
    expect(resolve("2027-01-01", records)).toMatchObject({ version: "1.1.0", gctCollectionRate: "0.60" });
    expect(historical).toMatchObject({ version: "1.0.0", effectiveTo: "2026-12-31" });
    expect(records).toHaveLength(2);
  });

  it("closes an open-ended historical period at the next version without mutating its record", () => {
    const historical = Object.freeze(policyRecord());
    const newer = Object.freeze(policyRecord({ version: "1.1.0", effectiveFrom: "2027-01-01" }));
    const records = Object.freeze([historical, newer]);

    expect(resolve("2026-12-31", records)).toMatchObject({ version: "1.0.0", effectiveTo: "2026-12-31" });
    expect(historical.effectiveTo).toBeUndefined();
  });

  it("rejects overlapping effective periods", () => {
    const records = [
      policyRecord({ effectiveTo: "2027-01-01" }),
      policyRecord({ version: "1.1.0", effectiveFrom: "2027-01-01" }),
    ];

    expect(() => resolve("2027-01-01", records)).toThrow("effective periods overlap");
  });

  it("rejects an effective-period gap instead of falling back to an older version", () => {
    const records = [
      policyRecord({ effectiveTo: "2026-12-30" }),
      policyRecord({ version: "1.1.0", effectiveFrom: "2027-01-01" }),
    ];

    expect(() => resolve("2026-12-31", records)).toThrow("No Signature Cape Winelands policy is effective");
  });

  it("rejects missing and inactive policies", () => {
    expect(() => resolveSignatureCapeWinelandsPaymentPolicy(CAPE_WINELANDS_JOURNEY_ID, new Date("2026-12-01T10:00:00Z"), []))
      .toThrow("No Signature Cape Winelands commercial payment policy is configured");
    expect(() => resolve("2026-12-01", [policyRecord({ status: "INACTIVE" })]))
      .toThrow("policy 1.0.0 is inactive");
  });

  it.each([
    ["missing effective-from date", { effectiveFrom: undefined }],
    ["invalid effective-from date", { effectiveFrom: "2026-02-30" }],
    ["invalid effective-to date", { effectiveTo: "2026-02-30" }],
    ["invalid rate", { gctCollectionRate: "1.01" }],
    ["invalid threshold", { leadTimeThresholdDays: 0 }],
    ["invalid timezone", { commercialTimeZone: "UTC" }],
    ["unsupported scope", { scope: "PRIVATE_DAY_TOUR" }],
    ["invalid version", { version: "latest" }],
    ["invalid policy identifier", { policyId: "Signature-CW" }],
  ])("rejects a policy with an %s", (_label, overrides) => {
    expect(() => resolve("2026-12-01", [policyRecord(overrides)]))
      .toThrow();
  });

  it("rejects inconsistent policy identifiers and duplicate versions", () => {
    expect(() => resolve("2026-12-01", [
      policyRecord(),
      policyRecord({ policyId: "OTHER_POLICY", version: "1.1.0", effectiveFrom: "2027-01-01" }),
    ])).toThrow("one stable policy identifier");
    expect(() => resolve("2026-12-01", [
      policyRecord(),
      policyRecord({ version: "1.0.0", effectiveFrom: "2027-01-01" }),
    ])).toThrow("Duplicate commercial payment policy version");
  });

  it("rejects unsupported journey identities and dates before the initial effective period", () => {
    expect(() => resolveSignatureCapeWinelandsPaymentPolicy("another-journey", new Date("2026-12-01T10:00:00Z")))
      .toThrow("Unsupported payment policy journey identity");
    expect(() => resolve("2026-11-16")).toThrow("No Signature Cape Winelands policy is effective");
  });

  it("keeps the configured policy source immutable", () => {
    expect(Object.isFrozen(SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICIES)).toBe(true);
    expect(Object.isFrozen(currentPolicy)).toBe(true);
    expect(resolve("2026-12-01").effectiveFrom).toBe("2026-11-17");
  });
});

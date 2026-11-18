import { SIGNATURE_CAPE_WINELANDS_COMMERCIAL_TIME_ZONE } from "./calendar-date";
import { CAPE_WINELANDS_JOURNEY_ID } from "./cape-winelands-journey-resolver";
export declare const SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICY_ID = "SIGNATURE_CAPE_WINELANDS_INITIAL_PAYMENT";
export declare const SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICY_SCOPE = "SIGNATURE_CAPE_WINELANDS_MULTI_DAY_PACKAGE";
export declare const SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICY_VERSION = "1.0.0";
export declare const SIGNATURE_CAPE_WINELANDS_LEAD_TIME_THRESHOLD_DAYS = 14;
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
export interface ResolvedSignatureCapeWinelandsPaymentPolicy extends Omit<SignatureCapeWinelandsPaymentPolicyRecord, "journeyId" | "scope" | "status" | "commercialTimeZone" | "leadTimeThresholdDays"> {
    readonly journeyId: typeof CAPE_WINELANDS_JOURNEY_ID;
    readonly scope: typeof SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICY_SCOPE;
    readonly status: "ACTIVE";
    readonly commercialTimeZone: typeof SIGNATURE_CAPE_WINELANDS_COMMERCIAL_TIME_ZONE;
    readonly leadTimeThresholdDays: typeof SIGNATURE_CAPE_WINELANDS_LEAD_TIME_THRESHOLD_DAYS;
}
export declare class SignatureCapeWinelandsPaymentPolicyResolutionError extends Error {
    constructor(message: string);
}
export declare const SIGNATURE_CAPE_WINELANDS_PAYMENT_POLICIES: ReadonlyArray<SignatureCapeWinelandsPaymentPolicyRecord>;
export declare function resolveSignatureCapeWinelandsPaymentPolicy(journeyId: string, bookingDate: Date, records?: ReadonlyArray<SignatureCapeWinelandsPaymentPolicyRecord>): ResolvedSignatureCapeWinelandsPaymentPolicy;
//# sourceMappingURL=signature-cape-winelands-payment-policy.d.ts.map
import { Money } from "../../../pricing";
import { JourneyQuoteResult } from "./journey-quote-service";
import { SIGNATURE_CAPE_WINELANDS_COMMERCIAL_TIME_ZONE } from "./calendar-date";
import type { ResolvedSignatureCapeWinelandsPaymentPolicy } from "./signature-cape-winelands-payment-policy";
declare const PAYMENT_POLICY_SCOPE = "SIGNATURE_CAPE_WINELANDS_MULTI_DAY_PACKAGE";
export type SignatureCapeWinelandsPaymentPolicy = ResolvedSignatureCapeWinelandsPaymentPolicy;
export interface GctCostingSource {
    readonly costingSourceId: string;
    readonly costingSourceVersion: string;
    readonly costingSourceEffectiveDate: string;
}
export interface InitialPaymentRequirement {
    readonly classification: "PARTIAL_PAYMENT" | "FULL_PAYMENT";
    readonly amountPayableAtBooking: Money;
    readonly contractualFutureBalance?: {
        readonly amount: Money;
        readonly dueDate: string;
    };
    readonly pricingSnapshotId: string;
    readonly commercialPolicy: {
        readonly policyId: string;
        readonly version: string;
        readonly appliedRate: string;
        readonly scope: typeof PAYMENT_POLICY_SCOPE;
        readonly effectiveFrom: string;
        readonly effectiveTo?: string;
        readonly leadTimeThresholdDays: number;
        readonly commercialTimeZone: typeof SIGNATURE_CAPE_WINELANDS_COMMERCIAL_TIME_ZONE;
    };
    readonly calculationBasis: {
        readonly commercialPolicy: InitialPaymentRequirement["commercialPolicy"];
        readonly bookingDate: string;
        readonly departureDate: string;
        readonly leadTimeDays: number;
        readonly commercialTimeZone: typeof SIGNATURE_CAPE_WINELANDS_COMMERCIAL_TIME_ZONE;
        readonly gctComponent: {
            readonly sourcePricingLineIdentifier: string;
            readonly amount: Money;
            readonly costingSourceId: string;
            readonly costingSourceVersion: string;
            readonly costingSourceEffectiveDate: string;
        };
        readonly accommodationComponents: ReadonlyArray<{
            readonly packageStopId: string;
            readonly sourcePricingLineIdentifier: string;
            readonly amount: Money;
        }>;
    };
}
export interface CalculateSignatureCapeWinelandsInitialPaymentInput {
    readonly quote: JourneyQuoteResult;
    readonly bookingDate: Date;
    readonly policy: SignatureCapeWinelandsPaymentPolicy | undefined;
    readonly costingSource?: GctCostingSource;
}
export declare class InitialPaymentCalculationError extends Error {
    constructor(message: string);
}
export declare function calculateSignatureCapeWinelandsInitialPaymentRequirement(input: CalculateSignatureCapeWinelandsInitialPaymentInput): InitialPaymentRequirement;
export {};
//# sourceMappingURL=signature-cape-winelands-initial-payment-calculator.d.ts.map
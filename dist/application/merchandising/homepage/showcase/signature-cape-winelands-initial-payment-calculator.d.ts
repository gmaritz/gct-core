import { Money } from "../../../pricing";
import { JourneyQuoteResult } from "./journey-quote-service";
declare const COMMERCIAL_TIME_ZONE = "Africa/Johannesburg";
export interface SignatureCapeWinelandsPaymentPolicy {
    readonly policyId: string;
    readonly version: string;
    readonly effectiveDate: string;
    readonly gctCollectionRate: string;
}
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
    };
    readonly calculationBasis: {
        readonly bookingDate: string;
        readonly departureDate: string;
        readonly leadTimeDays: number;
        readonly commercialTimeZone: typeof COMMERCIAL_TIME_ZONE;
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
    readonly policy?: SignatureCapeWinelandsPaymentPolicy;
    readonly costingSource?: GctCostingSource;
}
export declare class InitialPaymentCalculationError extends Error {
    constructor(message: string);
}
export declare function calculateSignatureCapeWinelandsInitialPaymentRequirement(input: CalculateSignatureCapeWinelandsInitialPaymentInput): InitialPaymentRequirement;
export {};
//# sourceMappingURL=signature-cape-winelands-initial-payment-calculator.d.ts.map
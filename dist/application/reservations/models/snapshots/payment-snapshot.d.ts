import { ReservationSnapshot } from "./reservation-snapshot";
import { PricingSnapshot } from "./pricing-snapshot";
export interface InitialPaymentRequirementMoney {
    readonly amount: number;
    readonly currency: string;
}
export interface InitialPaymentRequirementPolicy {
    readonly policyId: string;
    readonly version: string;
    readonly appliedRate: string;
    readonly scope: string;
    readonly effectiveFrom: string;
    readonly effectiveTo?: string;
    readonly leadTimeThresholdDays: number;
    readonly commercialTimeZone: string;
}
export interface InitialPaymentRequirementSnapshot {
    readonly classification: "PARTIAL_PAYMENT" | "FULL_PAYMENT";
    readonly amountPayableAtBooking: InitialPaymentRequirementMoney;
    readonly contractualFutureBalance?: {
        readonly amount: InitialPaymentRequirementMoney;
        readonly dueDate: string;
    };
    readonly pricingSnapshotId: string;
    readonly commercialPolicy: InitialPaymentRequirementPolicy;
    readonly calculationBasis: {
        readonly commercialPolicy: InitialPaymentRequirementPolicy;
        readonly bookingDate: string;
        readonly departureDate: string;
        readonly leadTimeDays: number;
        readonly commercialTimeZone: string;
        readonly gctComponent: {
            readonly sourcePricingLineIdentifier: string;
            readonly amount: InitialPaymentRequirementMoney;
            readonly costingSourceId: string;
            readonly costingSourceVersion: string;
            readonly costingSourceEffectiveDate: string;
        };
        readonly accommodationComponents: ReadonlyArray<{
            readonly packageStopId: string;
            readonly sourcePricingLineIdentifier: string;
            readonly amount: InitialPaymentRequirementMoney;
        }>;
    };
}
export declare function parseInitialPaymentRequirementSnapshot(value: unknown): InitialPaymentRequirementSnapshot;
export declare function initialPaymentRequirementMatchesPricingSnapshot(requirement: InitialPaymentRequirementSnapshot, pricing: Pick<PricingSnapshot, "snapshotId" | "currency" | "totalPrice">): boolean;
export interface PaymentSnapshot extends ReservationSnapshot {
    readonly paymentStatus: string;
    readonly paymentMethod?: string;
    readonly amountReceived: number;
    readonly balanceOutstanding: number;
    readonly initialRequirement?: InitialPaymentRequirementSnapshot;
}
//# sourceMappingURL=payment-snapshot.d.ts.map
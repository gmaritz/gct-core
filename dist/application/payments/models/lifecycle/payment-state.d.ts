import { AuthorizationRecord } from "../authorization";
import { CaptureRecord } from "../capture";
import { PaymentReference } from "../identity";
import { PaymentInstrument, PaymentMethod } from "../method";
import { RefundRecord } from "../refund";
import { SettlementRecord } from "../settlement";
import { PaymentStatus } from "./payment-status";
export interface PaymentReservationSnapshot {
    readonly snapshotId: string;
    readonly capturedAt: Date;
    readonly version: string;
    readonly reservationId: string;
    readonly reservationReference: string;
}
export interface PaymentQuoteSnapshot {
    readonly snapshotId: string;
    readonly capturedAt: Date;
    readonly version: string;
    readonly quoteId: string;
    readonly quotationNumber: string;
    readonly expiresAt: Date;
}
export interface PaymentPricingSnapshot {
    readonly snapshotId: string;
    readonly capturedAt: Date;
    readonly version: string;
    readonly pricingId: string;
    readonly subtotal: number;
    readonly taxes: number;
    readonly discounts: number;
    readonly fees: number;
    readonly total: number;
    readonly currency: string;
}
export interface PaymentState {
    readonly reference: PaymentReference;
    readonly reservationSnapshot: PaymentReservationSnapshot;
    readonly quoteSnapshot?: PaymentQuoteSnapshot;
    readonly pricingSnapshot: PaymentPricingSnapshot;
    readonly paymentAmount: number;
    readonly currency: string;
    readonly paymentMethod: PaymentMethod;
    readonly paymentInstrument?: PaymentInstrument;
    readonly status: PaymentStatus;
    readonly authorization?: AuthorizationRecord;
    readonly capture?: CaptureRecord;
    readonly settlement?: SettlementRecord;
    readonly refunds: ReadonlyArray<RefundRecord>;
}
export declare function createPaymentState(state: PaymentState): PaymentState;
//# sourceMappingURL=payment-state.d.ts.map
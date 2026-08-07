import { AuthorizationRecord, CaptureRecord, PaymentMetadata, PaymentMethod, PaymentPricingSnapshot, PaymentQuoteSnapshot, PaymentReference, PaymentReservationSnapshot, PaymentStatus, PaymentTimeline, PaymentInstrument, RefundRecord, SettlementRecord, TransactionReference } from "../models";
export interface PaymentComposition {
    readonly reference: PaymentReference;
    readonly transactionReference?: TransactionReference;
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
    readonly refunds?: ReadonlyArray<RefundRecord>;
    readonly timeline?: PaymentTimeline;
    readonly metadata: PaymentMetadata;
}
export declare class Payment {
    readonly reference: PaymentReference;
    readonly transactionReference?: TransactionReference;
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
    readonly timeline: PaymentTimeline;
    readonly metadata: PaymentMetadata;
    private constructor();
    static create(composition: PaymentComposition): Payment;
    static restore(composition: PaymentComposition): Payment;
}
//# sourceMappingURL=payment.d.ts.map
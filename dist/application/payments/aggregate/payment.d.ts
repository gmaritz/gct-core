export declare enum PaymentStatus {
    CREATED = "CREATED",
    PENDING_AUTHORIZATION = "PENDING_AUTHORIZATION",
    AUTHORIZED = "AUTHORIZED",
    AUTHORIZATION_FAILED = "AUTHORIZATION_FAILED",
    CAPTURED = "CAPTURED",
    SETTLED = "SETTLED",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    REFUND_REQUESTED = "REFUND_REQUESTED",
    REFUNDED = "REFUNDED"
}
export interface PaymentIdentity {
    readonly id: string;
}
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
export interface PaymentAuthorizationSnapshot {
    readonly snapshotId: string;
    readonly capturedAt: Date;
    readonly version: string;
    readonly authorizationId: string;
    readonly authorizedAt: Date;
    readonly amount: number;
    readonly currency: string;
    readonly providerReference: string;
    readonly status: string;
}
export interface PaymentCaptureSnapshot {
    readonly snapshotId: string;
    readonly capturedAt: Date;
    readonly version: string;
    readonly captureId: string;
    readonly amount: number;
    readonly currency: string;
    readonly providerReference: string;
    readonly status: string;
}
export interface PaymentSettlementSnapshot {
    readonly snapshotId: string;
    readonly capturedAt: Date;
    readonly version: string;
    readonly settlementId: string;
    readonly settledAt: Date;
    readonly amount: number;
    readonly currency: string;
    readonly providerReference: string;
    readonly status: string;
}
export interface PaymentRefundSnapshot {
    readonly snapshotId: string;
    readonly capturedAt: Date;
    readonly version: string;
    readonly refundId: string;
    readonly requestedAt: Date;
    readonly refundedAt?: Date;
    readonly amount: number;
    readonly currency: string;
    readonly reason: string;
    readonly status: string;
}
export interface PaymentTimelineEntry {
    readonly snapshotId: string;
    readonly capturedAt: Date;
    readonly version: string;
    readonly milestone: string;
    readonly occurredAt: Date;
    readonly note?: string;
}
export interface PaymentMetadata {
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly version: string;
    readonly source: string;
}
export interface PaymentComposition {
    readonly identity: PaymentIdentity;
    readonly reservationSnapshot: PaymentReservationSnapshot;
    readonly quoteSnapshot?: PaymentQuoteSnapshot;
    readonly pricingSnapshot: PaymentPricingSnapshot;
    readonly paymentAmount: number;
    readonly currency: string;
    readonly paymentMethod: string;
    readonly status: PaymentStatus;
    readonly authorizationSnapshot?: PaymentAuthorizationSnapshot;
    readonly captureSnapshot?: PaymentCaptureSnapshot;
    readonly settlementSnapshot?: PaymentSettlementSnapshot;
    readonly refunds?: ReadonlyArray<PaymentRefundSnapshot>;
    readonly timeline?: ReadonlyArray<PaymentTimelineEntry>;
    readonly metadata: PaymentMetadata;
}
export declare class Payment {
    readonly identity: PaymentIdentity;
    readonly reservationSnapshot: PaymentReservationSnapshot;
    readonly quoteSnapshot?: PaymentQuoteSnapshot;
    readonly pricingSnapshot: PaymentPricingSnapshot;
    readonly paymentAmount: number;
    readonly currency: string;
    readonly paymentMethod: string;
    readonly status: PaymentStatus;
    readonly authorizationSnapshot?: PaymentAuthorizationSnapshot;
    readonly captureSnapshot?: PaymentCaptureSnapshot;
    readonly settlementSnapshot?: PaymentSettlementSnapshot;
    readonly refunds: ReadonlyArray<PaymentRefundSnapshot>;
    readonly timeline: ReadonlyArray<PaymentTimelineEntry>;
    readonly metadata: PaymentMetadata;
    private constructor();
    static create(composition: PaymentComposition): Payment;
    static restore(composition: PaymentComposition): Payment;
}
//# sourceMappingURL=payment.d.ts.map
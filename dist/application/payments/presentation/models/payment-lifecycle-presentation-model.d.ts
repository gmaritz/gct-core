export interface PaymentLifecycleTimelineEntry {
    readonly eventType: string;
    readonly occurredAt: Date;
    readonly note?: string;
}
export interface PaymentLifecyclePresentationModel {
    readonly authorizationStatus: string;
    readonly captureStatus: string;
    readonly settlementStatus: string;
    readonly refundStatus: string;
    readonly lifecycleTimeline: ReadonlyArray<PaymentLifecycleTimelineEntry>;
}
export declare function createPaymentLifecyclePresentationModel(model: PaymentLifecyclePresentationModel): PaymentLifecyclePresentationModel;
//# sourceMappingURL=payment-lifecycle-presentation-model.d.ts.map
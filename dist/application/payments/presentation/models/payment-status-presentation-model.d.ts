export interface PaymentStatusPresentationModel {
    readonly headline: string;
    readonly statusBadge: "success" | "warning" | "neutral";
    readonly nextAction: string;
    readonly warnings: ReadonlyArray<string>;
    readonly informationalMessages: ReadonlyArray<string>;
}
export declare function createPaymentStatusPresentationModel(model: PaymentStatusPresentationModel): PaymentStatusPresentationModel;
//# sourceMappingURL=payment-status-presentation-model.d.ts.map
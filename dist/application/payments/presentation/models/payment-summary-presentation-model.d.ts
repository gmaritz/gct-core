export interface PaymentSummaryPresentationModel {
    readonly paymentReference: string;
    readonly reservationReference: string;
    readonly traveller: string;
    readonly totalAmount: number;
    readonly currency: string;
    readonly paymentMethod: string;
    readonly paymentStatus: string;
}
export declare function createPaymentSummaryPresentationModel(model: PaymentSummaryPresentationModel): PaymentSummaryPresentationModel;
//# sourceMappingURL=payment-summary-presentation-model.d.ts.map
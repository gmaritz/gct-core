export interface PaymentReference {
    readonly paymentId: string;
    readonly reservationId: string;
    readonly quotationNumber?: string;
}
export declare function createPaymentReference(reference: PaymentReference): PaymentReference;
//# sourceMappingURL=payment-reference.d.ts.map
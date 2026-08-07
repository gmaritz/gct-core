export interface PaymentProviderReference {
    readonly providerIdentifier: string;
    readonly reference: string;
    readonly correlationId?: string;
}
export declare function createPaymentProviderReference(reference: PaymentProviderReference): PaymentProviderReference;
//# sourceMappingURL=payment-provider-reference.d.ts.map
export interface PaymentInstrument {
    readonly instrumentType: string;
    readonly maskedIdentifier: string;
    readonly holderName?: string;
    readonly expiryMonth?: number;
    readonly expiryYear?: number;
}
export declare function createPaymentInstrument(instrument: PaymentInstrument): PaymentInstrument;
//# sourceMappingURL=payment-instrument.d.ts.map
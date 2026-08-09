export interface InvoicePaymentPresentationModel {
    readonly paymentId: string;
    readonly allocatedAmount: number;
    readonly allocatedAmountDisplay: string;
    readonly allocatedAt: Date;
    readonly allocatedAtDisplay: string;
    readonly externalReference?: string;
}
export declare function createInvoicePaymentPresentationModel(model: InvoicePaymentPresentationModel): InvoicePaymentPresentationModel;
//# sourceMappingURL=invoice-payment-presentation-model.d.ts.map
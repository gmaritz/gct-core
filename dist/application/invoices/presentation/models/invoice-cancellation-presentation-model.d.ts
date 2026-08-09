export interface InvoiceCancellationPresentationModel {
    readonly policyReference: string;
    readonly policyVersion?: string;
    readonly cancellationDate: Date;
    readonly cancellationDateDisplay: string;
    readonly cancellationCharge: number;
    readonly cancellationChargeDisplay: string;
    readonly refundableAmount: number;
    readonly refundableAmountDisplay: string;
}
export declare function createInvoiceCancellationPresentationModel(model: InvoiceCancellationPresentationModel): InvoiceCancellationPresentationModel;
//# sourceMappingURL=invoice-cancellation-presentation-model.d.ts.map
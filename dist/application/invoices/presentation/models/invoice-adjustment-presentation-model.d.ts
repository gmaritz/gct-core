export interface InvoiceAdjustmentPresentationModel {
    readonly id: string;
    readonly type: string;
    readonly amount: number;
    readonly amountDisplay: string;
    readonly reason: string;
    readonly appliedAt: Date;
    readonly appliedAtDisplay: string;
}
export declare function createInvoiceAdjustmentPresentationModel(model: InvoiceAdjustmentPresentationModel): InvoiceAdjustmentPresentationModel;
//# sourceMappingURL=invoice-adjustment-presentation-model.d.ts.map
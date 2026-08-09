export interface InvoiceAdjustment {
    readonly id: string;
    readonly type: string;
    readonly amount: number;
    readonly reason: string;
    readonly appliedAt: Date;
}
export declare function createInvoiceAdjustment(adjustment: InvoiceAdjustment): InvoiceAdjustment;
//# sourceMappingURL=invoice-adjustment.d.ts.map
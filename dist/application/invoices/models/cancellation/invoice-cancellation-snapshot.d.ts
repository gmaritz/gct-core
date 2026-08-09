export interface InvoiceCancellationSnapshot {
    readonly policyReference: string;
    readonly policyVersion?: string;
    readonly effectiveFrom?: Date;
    readonly effectiveTo?: Date;
    readonly cancellationDate: Date;
    readonly cancellationCharge: number;
    readonly refundableAmount: number;
}
export declare function createInvoiceCancellationSnapshot(snapshot: InvoiceCancellationSnapshot): InvoiceCancellationSnapshot;
//# sourceMappingURL=invoice-cancellation-snapshot.d.ts.map
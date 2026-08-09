export interface InvoicePricingSnapshot {
    readonly snapshotId: string;
    readonly pricingId: string;
    readonly capturedAt: Date;
    readonly version: string;
    readonly currency: string;
    readonly totalAmount: number;
}
export declare function createInvoicePricingSnapshot(snapshot: InvoicePricingSnapshot): InvoicePricingSnapshot;
//# sourceMappingURL=invoice-pricing-snapshot.d.ts.map
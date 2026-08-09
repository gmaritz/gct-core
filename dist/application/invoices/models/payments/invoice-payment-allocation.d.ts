export interface InvoicePaymentAllocation {
    readonly paymentId: string;
    readonly allocatedAmount: number;
    readonly allocatedAt: Date;
    readonly externalReference?: string;
}
export declare function createInvoicePaymentAllocation(allocation: InvoicePaymentAllocation): InvoicePaymentAllocation;
//# sourceMappingURL=invoice-payment-allocation.d.ts.map
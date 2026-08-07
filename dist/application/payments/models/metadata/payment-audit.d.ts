export interface PaymentAudit {
    readonly correlationId?: string;
    readonly requestId?: string;
    readonly traceId?: string;
    readonly createdBy?: string;
    readonly updatedBy?: string;
}
export declare function createPaymentAudit(audit: PaymentAudit): PaymentAudit;
//# sourceMappingURL=payment-audit.d.ts.map
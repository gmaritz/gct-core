export interface TransactionReference {
    readonly transactionId: string;
    readonly providerCorrelationId?: string;
    readonly customerReference?: string;
}
export declare function createTransactionReference(reference: TransactionReference): TransactionReference;
//# sourceMappingURL=transaction-reference.d.ts.map
export interface TransactionReference {
  readonly transactionId: string;
  readonly providerCorrelationId?: string;
  readonly customerReference?: string;
}

export function createTransactionReference(reference: TransactionReference): TransactionReference {
  return Object.freeze({
    transactionId: reference.transactionId,
    providerCorrelationId: reference.providerCorrelationId,
    customerReference: reference.customerReference,
  });
}

export interface InvoicePaymentAllocation {
  readonly paymentId: string;
  readonly allocatedAmount: number;
  readonly allocatedAt: Date;
  readonly externalReference?: string;
}

export function createInvoicePaymentAllocation(
  allocation: InvoicePaymentAllocation,
): InvoicePaymentAllocation {
  return Object.freeze({
    paymentId: allocation.paymentId,
    allocatedAmount: allocation.allocatedAmount,
    allocatedAt: new Date(allocation.allocatedAt.getTime()),
    externalReference: allocation.externalReference,
  });
}
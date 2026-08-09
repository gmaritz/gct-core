export interface InvoiceFinancialObligation {
  readonly totalAmount: number;
  readonly currency: string;
}

export function createInvoiceFinancialObligation(
  obligation: InvoiceFinancialObligation,
): InvoiceFinancialObligation {
  return Object.freeze({
    totalAmount: obligation.totalAmount,
    currency: obligation.currency,
  });
}
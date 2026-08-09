export interface InvoiceReference {
  readonly invoiceId: string;
}

export function createInvoiceReference(reference: InvoiceReference): InvoiceReference {
  return Object.freeze({
    invoiceId: reference.invoiceId,
  });
}
export interface InvoiceQuoteReference {
  readonly quoteId: string;
  readonly quoteVersion: string;
}

export function createInvoiceQuoteReference(reference: InvoiceQuoteReference): InvoiceQuoteReference {
  return Object.freeze({
    quoteId: reference.quoteId,
    quoteVersion: reference.quoteVersion,
  });
}
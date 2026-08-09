export interface InvoiceExternalReference {
  readonly system: string;
  readonly reference: string;
}

export function createInvoiceExternalReference(reference: InvoiceExternalReference): InvoiceExternalReference {
  return Object.freeze({
    system: reference.system,
    reference: reference.reference,
  });
}
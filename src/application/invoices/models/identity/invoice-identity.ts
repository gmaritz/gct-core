export interface InvoiceIdentity {
  readonly id: string;
}

export function createInvoiceIdentity(identity: InvoiceIdentity): InvoiceIdentity {
  return Object.freeze({
    id: identity.id,
  });
}
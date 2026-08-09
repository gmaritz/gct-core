export interface InvoiceCustomerReference {
  readonly customerId?: string;
  readonly travellerId?: string;
}

export function createInvoiceCustomerReference(reference: InvoiceCustomerReference): InvoiceCustomerReference {
  return Object.freeze({
    customerId: reference.customerId,
    travellerId: reference.travellerId,
  });
}
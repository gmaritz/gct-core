export interface InvoiceReservationReference {
  readonly reservationId: string;
}

export function createInvoiceReservationReference(
  reference: InvoiceReservationReference,
): InvoiceReservationReference {
  return Object.freeze({
    reservationId: reference.reservationId,
  });
}
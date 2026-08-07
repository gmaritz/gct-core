export interface PaymentReference {
  readonly paymentId: string;
  readonly reservationId: string;
  readonly quotationNumber?: string;
}

export function createPaymentReference(reference: PaymentReference): PaymentReference {
  return Object.freeze({
    paymentId: reference.paymentId,
    reservationId: reference.reservationId,
    quotationNumber: reference.quotationNumber,
  });
}

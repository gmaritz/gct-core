export interface PaymentSummaryPresentationModel {
  readonly paymentReference: string;
  readonly reservationReference: string;
  readonly traveller: string;
  readonly totalAmount: number;
  readonly currency: string;
  readonly paymentMethod: string;
  readonly paymentStatus: string;
}

export function createPaymentSummaryPresentationModel(
  model: PaymentSummaryPresentationModel,
): PaymentSummaryPresentationModel {
  return Object.freeze({
    paymentReference: model.paymentReference,
    reservationReference: model.reservationReference,
    traveller: model.traveller,
    totalAmount: model.totalAmount,
    currency: model.currency,
    paymentMethod: model.paymentMethod,
    paymentStatus: model.paymentStatus,
  });
}

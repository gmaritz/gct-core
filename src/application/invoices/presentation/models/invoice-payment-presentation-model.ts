export interface InvoicePaymentPresentationModel {
  readonly paymentId: string;
  readonly allocatedAmount: number;
  readonly allocatedAmountDisplay: string;
  readonly allocatedAt: Date;
  readonly allocatedAtDisplay: string;
  readonly externalReference?: string;
}

export function createInvoicePaymentPresentationModel(
  model: InvoicePaymentPresentationModel,
): InvoicePaymentPresentationModel {
  return Object.freeze({
    paymentId: model.paymentId,
    allocatedAmount: model.allocatedAmount,
    allocatedAmountDisplay: model.allocatedAmountDisplay,
    allocatedAt: new Date(model.allocatedAt.getTime()),
    allocatedAtDisplay: model.allocatedAtDisplay,
    externalReference: model.externalReference,
  });
}

export interface InvoiceCancellationPresentationModel {
  readonly policyReference: string;
  readonly policyVersion?: string;
  readonly cancellationDate: Date;
  readonly cancellationDateDisplay: string;
  readonly cancellationCharge: number;
  readonly cancellationChargeDisplay: string;
  readonly refundableAmount: number;
  readonly refundableAmountDisplay: string;
}

export function createInvoiceCancellationPresentationModel(
  model: InvoiceCancellationPresentationModel,
): InvoiceCancellationPresentationModel {
  return Object.freeze({
    policyReference: model.policyReference,
    policyVersion: model.policyVersion,
    cancellationDate: new Date(model.cancellationDate.getTime()),
    cancellationDateDisplay: model.cancellationDateDisplay,
    cancellationCharge: model.cancellationCharge,
    cancellationChargeDisplay: model.cancellationChargeDisplay,
    refundableAmount: model.refundableAmount,
    refundableAmountDisplay: model.refundableAmountDisplay,
  });
}

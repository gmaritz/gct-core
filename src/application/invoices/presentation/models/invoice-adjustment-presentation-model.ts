export interface InvoiceAdjustmentPresentationModel {
  readonly id: string;
  readonly type: string;
  readonly amount: number;
  readonly amountDisplay: string;
  readonly reason: string;
  readonly appliedAt: Date;
  readonly appliedAtDisplay: string;
}

export function createInvoiceAdjustmentPresentationModel(
  model: InvoiceAdjustmentPresentationModel,
): InvoiceAdjustmentPresentationModel {
  return Object.freeze({
    id: model.id,
    type: model.type,
    amount: model.amount,
    amountDisplay: model.amountDisplay,
    reason: model.reason,
    appliedAt: new Date(model.appliedAt.getTime()),
    appliedAtDisplay: model.appliedAtDisplay,
  });
}

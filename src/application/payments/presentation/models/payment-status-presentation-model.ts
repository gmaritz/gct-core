export interface PaymentStatusPresentationModel {
  readonly headline: string;
  readonly statusBadge: "success" | "warning" | "neutral";
  readonly nextAction: string;
  readonly warnings: ReadonlyArray<string>;
  readonly informationalMessages: ReadonlyArray<string>;
}

export function createPaymentStatusPresentationModel(
  model: PaymentStatusPresentationModel,
): PaymentStatusPresentationModel {
  return Object.freeze({
    headline: model.headline,
    statusBadge: model.statusBadge,
    nextAction: model.nextAction,
    warnings: Object.freeze([...(model.warnings ?? [])]),
    informationalMessages: Object.freeze([...(model.informationalMessages ?? [])]),
  });
}

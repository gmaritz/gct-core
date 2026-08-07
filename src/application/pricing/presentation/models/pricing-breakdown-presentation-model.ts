export interface PricingBreakdownPresentationModel {
  readonly accommodationSubtotal: number;
  readonly experiencesSubtotal: number;
  readonly taxes: number;
  readonly fees: number;
  readonly discounts: number;
  readonly markups: number;
  readonly commissions: number;
  readonly grandTotal: number;
  readonly currency: string;
}

export function createPricingBreakdownPresentationModel(
  model: PricingBreakdownPresentationModel,
): PricingBreakdownPresentationModel {
  return Object.freeze({
    accommodationSubtotal: model.accommodationSubtotal,
    experiencesSubtotal: model.experiencesSubtotal,
    taxes: model.taxes,
    fees: model.fees,
    discounts: model.discounts,
    markups: model.markups,
    commissions: model.commissions,
    grandTotal: model.grandTotal,
    currency: model.currency,
  });
}

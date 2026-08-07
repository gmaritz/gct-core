export interface PricingSummaryPresentationModel {
  readonly totalPrice: number;
  readonly currency: string;
  readonly travellerCount: number;
  readonly duration: string;
  readonly destination: string;
  readonly primaryCommercialMessage: string;
}

export function createPricingSummaryPresentationModel(
  model: PricingSummaryPresentationModel,
): PricingSummaryPresentationModel {
  return Object.freeze({
    totalPrice: model.totalPrice,
    currency: model.currency,
    travellerCount: model.travellerCount,
    duration: model.duration,
    destination: model.destination,
    primaryCommercialMessage: model.primaryCommercialMessage,
  });
}

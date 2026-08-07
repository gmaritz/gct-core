export interface PricingSummary {
  readonly productId: string;
  readonly productType: string;
  readonly description: string;
}

export function createPricingSummary(summary: PricingSummary): PricingSummary {
  return Object.freeze({
    productId: summary.productId,
    productType: summary.productType,
    description: summary.description,
  });
}

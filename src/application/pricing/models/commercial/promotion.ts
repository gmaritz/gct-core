export interface Promotion {
  readonly code: string;
  readonly label: string;
  readonly description?: string;
}

export function createPromotion(promotion: Promotion): Promotion {
  return Object.freeze({
    code: promotion.code,
    label: promotion.label,
    description: promotion.description,
  });
}

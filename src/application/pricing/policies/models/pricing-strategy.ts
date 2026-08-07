export interface PricingStrategy {
  readonly id: string;
  readonly type: string;
  readonly profile: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

export function createPricingStrategy(strategy: PricingStrategy): PricingStrategy {
  return Object.freeze({
    id: strategy.id,
    type: strategy.type,
    profile: strategy.profile,
    metadata: strategy.metadata ? Object.freeze({ ...strategy.metadata }) : undefined,
  });
}

import { createPricingStrategy, PricingStrategy } from "./pricing-strategy";

export interface PricingStrategySet {
  readonly strategies: ReadonlyArray<PricingStrategy>;
  readonly warnings: ReadonlyArray<string>;
  readonly metadata: {
    readonly generatedAt: Date;
    readonly version: string;
    readonly source: string;
  };
}

export function createPricingStrategySet(input: {
  readonly strategies?: ReadonlyArray<PricingStrategy>;
  readonly warnings?: ReadonlyArray<string>;
  readonly metadata: {
    readonly generatedAt: Date;
    readonly version: string;
    readonly source: string;
  };
}): PricingStrategySet {
  return Object.freeze({
    strategies: Object.freeze([...(input.strategies ?? []).map(createPricingStrategy)]),
    warnings: Object.freeze([...(input.warnings ?? [])]),
    metadata: Object.freeze({
      generatedAt: new Date(input.metadata.generatedAt.getTime()),
      version: input.metadata.version,
      source: input.metadata.source,
    }),
  });
}

import { createPricingBreakdown, createPricingTotal, PricingBreakdown, PricingTotal } from "../../models";

export interface PricingCalculationResult {
  readonly breakdown: PricingBreakdown;
  readonly totals: PricingTotal;
  readonly warnings: ReadonlyArray<string>;
  readonly metadata: {
    readonly calculatedAt: Date;
    readonly version: string;
    readonly source: string;
    readonly calculatorsExecuted: ReadonlyArray<string>;
  };
}

export function createPricingCalculationResult(input: {
  readonly breakdown: PricingBreakdown;
  readonly totals: PricingTotal;
  readonly warnings?: ReadonlyArray<string>;
  readonly metadata: {
    readonly calculatedAt: Date;
    readonly version: string;
    readonly source: string;
    readonly calculatorsExecuted?: ReadonlyArray<string>;
  };
}): PricingCalculationResult {
  return Object.freeze({
    breakdown: createPricingBreakdown(input.breakdown),
    totals: createPricingTotal(input.totals),
    warnings: Object.freeze([...(input.warnings ?? [])]),
    metadata: Object.freeze({
      calculatedAt: new Date(input.metadata.calculatedAt.getTime()),
      version: input.metadata.version,
      source: input.metadata.source,
      calculatorsExecuted: Object.freeze([...(input.metadata.calculatorsExecuted ?? [])]),
    }),
  });
}

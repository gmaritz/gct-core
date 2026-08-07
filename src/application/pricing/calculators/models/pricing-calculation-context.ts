import { Currency, createPricingBreakdown, createPricingTotal, PricingBreakdown, PricingTotal } from "../../models";
import { PricingStrategySet, createPricingStrategySet } from "../../policies";
import { PricingValidationRequest } from "../../validation";
import { PricingCalculatorStage } from "./pricing-calculator-stage";

export interface PricingCalculationContext {
  readonly pricingRequest: PricingValidationRequest;
  readonly pricingStrategySet: PricingStrategySet;
  readonly currentPricingBreakdown: PricingBreakdown;
  readonly calculatedTotals: PricingTotal;
  readonly currency: Currency;
  readonly warnings: ReadonlyArray<string>;
  readonly calculationMetadata: {
    readonly calculatedAt: Date;
    readonly version: string;
    readonly source: string;
    readonly currentStage?: PricingCalculatorStage;
  };
}

export function createPricingCalculationContext(context: PricingCalculationContext): PricingCalculationContext {
  return Object.freeze({
    pricingRequest: context.pricingRequest,
    pricingStrategySet: createPricingStrategySet(context.pricingStrategySet),
    currentPricingBreakdown: createPricingBreakdown(context.currentPricingBreakdown),
    calculatedTotals: createPricingTotal(context.calculatedTotals),
    currency: context.currency,
    warnings: Object.freeze([...(context.warnings ?? [])]),
    calculationMetadata: Object.freeze({
      calculatedAt: new Date(context.calculationMetadata.calculatedAt.getTime()),
      version: context.calculationMetadata.version,
      source: context.calculationMetadata.source,
      currentStage: context.calculationMetadata.currentStage,
    }),
  });
}

import {
  Commission,
  Currency,
  Discount,
  Fee,
  Markup,
  PricingBreakdown,
  PricingSummary,
  PricingTotal,
  Promotion,
  Quote,
  TaxBreakdown,
} from "../models";
import {
  createPricingValidationError,
  createPricingValidationResult,
  PricingValidationErrorCode,
  PricingValidationResult,
  PricingValidationStage,
} from "./models";

export interface PricingValidationRequest {
  readonly currency?: Currency | null;
  readonly summary?: PricingSummary | null;
  readonly breakdown?: PricingBreakdown | null;
  readonly taxes?: TaxBreakdown | null;
  readonly fees?: ReadonlyArray<Fee> | null;
  readonly discounts?: ReadonlyArray<Discount> | null;
  readonly markups?: ReadonlyArray<Markup> | null;
  readonly commissions?: ReadonlyArray<Commission> | null;
  readonly promotions?: ReadonlyArray<Promotion> | null;
  readonly totals?: PricingTotal | null;
  readonly quote?: Quote | null;
}

export class PricingRequestValidator {
  public validate(request: PricingValidationRequest): PricingValidationResult {
    const errors = [];

    if (!request.summary || !request.breakdown || !request.totals) {
      errors.push(
        createPricingValidationError({
          code: PricingValidationErrorCode.MISSING_PRICING_INPUTS,
          stage: PricingValidationStage.REQUEST,
          message: "Pricing summary, breakdown and totals are required.",
          critical: true,
        }),
      );
    }

    if (!request.breakdown || request.breakdown.lineItems.length === 0) {
      errors.push(
        createPricingValidationError({
          code: PricingValidationErrorCode.MISSING_BREAKDOWN,
          stage: PricingValidationStage.REQUEST,
          message: "Pricing breakdown line items are required.",
          critical: true,
        }),
      );
    }

    if (typeof request.currency === "undefined" || request.currency === null) {
      errors.push(
        createPricingValidationError({
          code: PricingValidationErrorCode.MISSING_CURRENCY,
          stage: PricingValidationStage.REQUEST,
          message: "Currency is required.",
          critical: true,
        }),
      );
    }

    return createPricingValidationResult({
      stage: PricingValidationStage.REQUEST,
      errors,
      metadata: {
        validatedAt: new Date(),
        version: "1.0.0",
        source: "PricingRequestValidator",
      },
    });
  }
}

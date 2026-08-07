import {
  createPricingValidationError,
  createPricingValidationResult,
  PricingValidationErrorCode,
  PricingValidationResult,
  PricingValidationStage,
} from "./models";
import { PricingValidationRequest } from "./pricing-request-validator";

export class CommercialValidator {
  public validate(request: PricingValidationRequest): PricingValidationResult {
    const errors = [];

    if ((request.discounts ?? []).some((discount) => discount.amount.amount < 0)) {
      errors.push(
        createPricingValidationError({
          code: PricingValidationErrorCode.INVALID_DISCOUNT,
          stage: PricingValidationStage.COMMERCIAL,
          message: "Discount amounts must be non-negative.",
          critical: false,
        }),
      );
    }

    if ((request.markups ?? []).some((markup) => markup.amount.amount < 0)) {
      errors.push(
        createPricingValidationError({
          code: PricingValidationErrorCode.INVALID_MARKUP,
          stage: PricingValidationStage.COMMERCIAL,
          message: "Markup amounts must be non-negative.",
          critical: false,
        }),
      );
    }

    if ((request.commissions ?? []).some((commission) => commission.amount.amount < 0)) {
      errors.push(
        createPricingValidationError({
          code: PricingValidationErrorCode.INVALID_COMMISSION,
          stage: PricingValidationStage.COMMERCIAL,
          message: "Commission amounts must be non-negative.",
          critical: false,
        }),
      );
    }

    if ((request.promotions ?? []).some((promotion) => promotion.code.trim().length === 0)) {
      errors.push(
        createPricingValidationError({
          code: PricingValidationErrorCode.INVALID_PROMOTION,
          stage: PricingValidationStage.COMMERCIAL,
          message: "Promotions require valid codes.",
          critical: false,
        }),
      );
    }

    return createPricingValidationResult({
      stage: PricingValidationStage.COMMERCIAL,
      errors,
      metadata: {
        validatedAt: new Date(),
        version: "1.0.0",
        source: "CommercialValidator",
      },
    });
  }
}

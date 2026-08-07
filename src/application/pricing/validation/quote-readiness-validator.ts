import { QuoteStatus } from "../models";
import {
  createPricingValidationError,
  createPricingValidationResult,
  PricingValidationErrorCode,
  PricingValidationResult,
  PricingValidationStage,
} from "./models";
import { PricingValidationRequest } from "./pricing-request-validator";

export class QuoteReadinessValidator {
  public validate(request: PricingValidationRequest): PricingValidationResult {
    const errors = [];

    if (!request.quote) {
      return createPricingValidationResult({
        stage: PricingValidationStage.QUOTE_READINESS,
        warnings: ["Quote contract not supplied."],
        metadata: {
          validatedAt: new Date(),
          version: "1.0.0",
          source: "QuoteReadinessValidator",
        },
      });
    }

    if (!request.quote.metadata) {
      errors.push(
        createPricingValidationError({
          code: PricingValidationErrorCode.MISSING_QUOTE_METADATA,
          stage: PricingValidationStage.QUOTE_READINESS,
          message: "Quote metadata is required.",
          critical: true,
        }),
      );
    }

    if (!request.quote.metadata || !request.quote.metadata.expiresAt) {
      errors.push(
        createPricingValidationError({
          code: PricingValidationErrorCode.MISSING_QUOTE_EXPIRY,
          stage: PricingValidationStage.QUOTE_READINESS,
          message: "Quote expiry is required.",
          critical: true,
        }),
      );
    }

    if (
      request.quote.status === QuoteStatus.DRAFT ||
      request.quote.items.length === 0 ||
      request.quote.total.amount <= 0
    ) {
      errors.push(
        createPricingValidationError({
          code: PricingValidationErrorCode.INCOMPLETE_QUOTATION,
          stage: PricingValidationStage.QUOTE_READINESS,
          message: "Quote is incomplete for issuance.",
          critical: false,
        }),
      );
    }

    return createPricingValidationResult({
      stage: PricingValidationStage.QUOTE_READINESS,
      errors,
      metadata: {
        validatedAt: new Date(),
        version: "1.0.0",
        source: "QuoteReadinessValidator",
      },
    });
  }
}

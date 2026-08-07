"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuoteReadinessValidator = void 0;
const models_1 = require("../models");
const models_2 = require("./models");
class QuoteReadinessValidator {
    validate(request) {
        const errors = [];
        if (!request.quote) {
            return (0, models_2.createPricingValidationResult)({
                stage: models_2.PricingValidationStage.QUOTE_READINESS,
                warnings: ["Quote contract not supplied."],
                metadata: {
                    validatedAt: new Date(),
                    version: "1.0.0",
                    source: "QuoteReadinessValidator",
                },
            });
        }
        if (!request.quote.metadata) {
            errors.push((0, models_2.createPricingValidationError)({
                code: models_2.PricingValidationErrorCode.MISSING_QUOTE_METADATA,
                stage: models_2.PricingValidationStage.QUOTE_READINESS,
                message: "Quote metadata is required.",
                critical: true,
            }));
        }
        if (!request.quote.metadata || !request.quote.metadata.expiresAt) {
            errors.push((0, models_2.createPricingValidationError)({
                code: models_2.PricingValidationErrorCode.MISSING_QUOTE_EXPIRY,
                stage: models_2.PricingValidationStage.QUOTE_READINESS,
                message: "Quote expiry is required.",
                critical: true,
            }));
        }
        if (request.quote.status === models_1.QuoteStatus.DRAFT ||
            request.quote.items.length === 0 ||
            request.quote.total.amount <= 0) {
            errors.push((0, models_2.createPricingValidationError)({
                code: models_2.PricingValidationErrorCode.INCOMPLETE_QUOTATION,
                stage: models_2.PricingValidationStage.QUOTE_READINESS,
                message: "Quote is incomplete for issuance.",
                critical: false,
            }));
        }
        return (0, models_2.createPricingValidationResult)({
            stage: models_2.PricingValidationStage.QUOTE_READINESS,
            errors,
            metadata: {
                validatedAt: new Date(),
                version: "1.0.0",
                source: "QuoteReadinessValidator",
            },
        });
    }
}
exports.QuoteReadinessValidator = QuoteReadinessValidator;
//# sourceMappingURL=quote-readiness-validator.js.map
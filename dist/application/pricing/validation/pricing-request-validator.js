"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingRequestValidator = void 0;
const models_1 = require("./models");
class PricingRequestValidator {
    validate(request) {
        const errors = [];
        if (!request.summary || !request.breakdown || !request.totals) {
            errors.push((0, models_1.createPricingValidationError)({
                code: models_1.PricingValidationErrorCode.MISSING_PRICING_INPUTS,
                stage: models_1.PricingValidationStage.REQUEST,
                message: "Pricing summary, breakdown and totals are required.",
                critical: true,
            }));
        }
        if (!request.breakdown || request.breakdown.lineItems.length === 0) {
            errors.push((0, models_1.createPricingValidationError)({
                code: models_1.PricingValidationErrorCode.MISSING_BREAKDOWN,
                stage: models_1.PricingValidationStage.REQUEST,
                message: "Pricing breakdown line items are required.",
                critical: true,
            }));
        }
        if (typeof request.currency === "undefined" || request.currency === null) {
            errors.push((0, models_1.createPricingValidationError)({
                code: models_1.PricingValidationErrorCode.MISSING_CURRENCY,
                stage: models_1.PricingValidationStage.REQUEST,
                message: "Currency is required.",
                critical: true,
            }));
        }
        return (0, models_1.createPricingValidationResult)({
            stage: models_1.PricingValidationStage.REQUEST,
            errors,
            metadata: {
                validatedAt: new Date(),
                version: "1.0.0",
                source: "PricingRequestValidator",
            },
        });
    }
}
exports.PricingRequestValidator = PricingRequestValidator;
//# sourceMappingURL=pricing-request-validator.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommercialValidator = void 0;
const models_1 = require("./models");
class CommercialValidator {
    validate(request) {
        const errors = [];
        if ((request.discounts ?? []).some((discount) => discount.amount.amount < 0)) {
            errors.push((0, models_1.createPricingValidationError)({
                code: models_1.PricingValidationErrorCode.INVALID_DISCOUNT,
                stage: models_1.PricingValidationStage.COMMERCIAL,
                message: "Discount amounts must be non-negative.",
                critical: false,
            }));
        }
        if ((request.markups ?? []).some((markup) => markup.amount.amount < 0)) {
            errors.push((0, models_1.createPricingValidationError)({
                code: models_1.PricingValidationErrorCode.INVALID_MARKUP,
                stage: models_1.PricingValidationStage.COMMERCIAL,
                message: "Markup amounts must be non-negative.",
                critical: false,
            }));
        }
        if ((request.commissions ?? []).some((commission) => commission.amount.amount < 0)) {
            errors.push((0, models_1.createPricingValidationError)({
                code: models_1.PricingValidationErrorCode.INVALID_COMMISSION,
                stage: models_1.PricingValidationStage.COMMERCIAL,
                message: "Commission amounts must be non-negative.",
                critical: false,
            }));
        }
        if ((request.promotions ?? []).some((promotion) => promotion.code.trim().length === 0)) {
            errors.push((0, models_1.createPricingValidationError)({
                code: models_1.PricingValidationErrorCode.INVALID_PROMOTION,
                stage: models_1.PricingValidationStage.COMMERCIAL,
                message: "Promotions require valid codes.",
                critical: false,
            }));
        }
        return (0, models_1.createPricingValidationResult)({
            stage: models_1.PricingValidationStage.COMMERCIAL,
            errors,
            metadata: {
                validatedAt: new Date(),
                version: "1.0.0",
                source: "CommercialValidator",
            },
        });
    }
}
exports.CommercialValidator = CommercialValidator;
//# sourceMappingURL=commercial-validator.js.map
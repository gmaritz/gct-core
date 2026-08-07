"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingValidator = void 0;
const models_1 = require("../models");
class PricingValidator {
    validate(request) {
        const errors = [];
        if (!request.pricingSnapshot) {
            errors.push((0, models_1.createPaymentValidationError)({
                stage: models_1.PaymentValidationStage.PRICING,
                code: models_1.PaymentValidationErrorCode.MISSING_PRICING_SNAPSHOT,
                message: "Pricing snapshot is required.",
                severity: "CRITICAL",
            }));
            return (0, models_1.createPaymentValidationResult)({
                stage: models_1.PaymentValidationStage.PRICING,
                errors,
                metadata: {
                    validatedAt: new Date(),
                    version: "1.0.0",
                    source: "PricingValidator",
                },
            });
        }
        if (request.pricingSnapshot.total <= 0) {
            errors.push((0, models_1.createPaymentValidationError)({
                stage: models_1.PaymentValidationStage.PRICING,
                code: models_1.PaymentValidationErrorCode.INVALID_PRICING_TOTAL,
                message: "Pricing total must be greater than zero.",
                severity: "CRITICAL",
            }));
        }
        if (typeof request.paymentAmount !== "number" || request.paymentAmount <= 0) {
            errors.push((0, models_1.createPaymentValidationError)({
                stage: models_1.PaymentValidationStage.PRICING,
                code: models_1.PaymentValidationErrorCode.INVALID_PAYABLE_AMOUNT,
                message: "Payable amount must be greater than zero.",
                severity: "CRITICAL",
            }));
        }
        if (request.currency && request.pricingSnapshot.currency !== request.currency) {
            errors.push((0, models_1.createPaymentValidationError)({
                stage: models_1.PaymentValidationStage.PRICING,
                code: models_1.PaymentValidationErrorCode.CURRENCY_MISMATCH,
                message: "Payment currency must match pricing currency.",
                severity: "CRITICAL",
            }));
        }
        return (0, models_1.createPaymentValidationResult)({
            stage: models_1.PaymentValidationStage.PRICING,
            errors,
            metadata: {
                validatedAt: new Date(),
                version: "1.0.0",
                source: "PricingValidator",
            },
        });
    }
}
exports.PricingValidator = PricingValidator;
//# sourceMappingURL=pricing-validator.js.map
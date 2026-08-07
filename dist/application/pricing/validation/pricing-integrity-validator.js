"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingIntegrityValidator = void 0;
const models_1 = require("./models");
function addMoney(left, right) {
    return {
        amount: left.amount + right.amount,
        currency: left.currency,
    };
}
function subtractMoney(left, right) {
    return {
        amount: left.amount - right.amount,
        currency: left.currency,
    };
}
function matchesCurrency(expected, values) {
    return values.every((value) => value.currency === expected);
}
class PricingIntegrityValidator {
    validate(request) {
        const errors = [];
        if (!request.taxes || request.taxes.entries.length === 0) {
            errors.push((0, models_1.createPricingValidationError)({
                code: models_1.PricingValidationErrorCode.MISSING_TAXES,
                stage: models_1.PricingValidationStage.INTEGRITY,
                message: "Tax configuration is required.",
                critical: true,
            }));
        }
        if (!request.fees || request.fees.length === 0) {
            errors.push((0, models_1.createPricingValidationError)({
                code: models_1.PricingValidationErrorCode.MISSING_FEES,
                stage: models_1.PricingValidationStage.INTEGRITY,
                message: "Fee structure is required.",
                critical: false,
            }));
        }
        if (request.currency && request.totals) {
            const totals = request.totals;
            const totalMoneyParts = [
                totals.subtotal,
                totals.taxTotal,
                totals.feeTotal,
                totals.discountTotal,
                totals.markupTotal,
                totals.commissionTotal,
                totals.grandTotal,
            ];
            const breakdownCurrencies = (request.breakdown?.lineItems ?? []).flatMap((lineItem) => [lineItem.unitAmount, lineItem.totalAmount]);
            const taxCurrencies = request.taxes?.entries.map((entry) => entry.amount) ?? [];
            const feeCurrencies = (request.fees ?? []).map((fee) => fee.amount);
            const discountCurrencies = (request.discounts ?? []).map((discount) => discount.amount);
            const markupCurrencies = (request.markups ?? []).map((markup) => markup.amount);
            const commissionCurrencies = (request.commissions ?? []).map((commission) => commission.amount);
            const consistent = matchesCurrency(request.currency, [
                ...totalMoneyParts,
                ...breakdownCurrencies,
                ...taxCurrencies,
                ...feeCurrencies,
                ...discountCurrencies,
                ...markupCurrencies,
                ...commissionCurrencies,
            ]);
            if (!consistent) {
                errors.push((0, models_1.createPricingValidationError)({
                    code: models_1.PricingValidationErrorCode.CURRENCY_INCONSISTENCY,
                    stage: models_1.PricingValidationStage.INTEGRITY,
                    message: "Currency must be consistent across pricing components.",
                    critical: true,
                }));
            }
            const expectedGrandTotal = subtractMoney(addMoney(addMoney(addMoney(totals.subtotal, totals.taxTotal), totals.feeTotal), totals.markupTotal), addMoney(totals.discountTotal, totals.commissionTotal));
            if (expectedGrandTotal.amount !== totals.grandTotal.amount) {
                errors.push((0, models_1.createPricingValidationError)({
                    code: models_1.PricingValidationErrorCode.TOTALS_MISMATCH,
                    stage: models_1.PricingValidationStage.INTEGRITY,
                    message: "Pricing totals are inconsistent.",
                    critical: true,
                }));
            }
        }
        return (0, models_1.createPricingValidationResult)({
            stage: models_1.PricingValidationStage.INTEGRITY,
            errors,
            metadata: {
                validatedAt: new Date(),
                version: "1.0.0",
                source: "PricingIntegrityValidator",
            },
        });
    }
}
exports.PricingIntegrityValidator = PricingIntegrityValidator;
//# sourceMappingURL=pricing-integrity-validator.js.map
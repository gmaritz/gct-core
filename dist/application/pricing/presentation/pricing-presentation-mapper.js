"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingPresentationMapper = void 0;
const models_1 = require("./models");
function sumQuantity(lineItems) {
    const total = lineItems.reduce((value, lineItem) => value + lineItem.quantity, 0);
    return total > 0 ? total : 1;
}
function stageMessage(stages) {
    const lastStage = stages[stages.length - 1];
    if (!lastStage) {
        return "Pricing generated";
    }
    return `Pricing generated via ${lastStage.toLowerCase()} stage`;
}
function amountByCode(lineItems, codeMatch) {
    const item = lineItems.find((lineItem) => lineItem.code.toUpperCase().includes(codeMatch));
    return item?.totalAmount.amount ?? 0;
}
class PricingPresentationMapper {
    map(result) {
        if (!result.successful || !result.pricing) {
            return null;
        }
        const pricing = result.pricing;
        const summary = (0, models_1.createPricingSummaryPresentationModel)({
            totalPrice: pricing.totals.grandTotal.amount,
            currency: pricing.currency,
            travellerCount: sumQuantity(pricing.breakdown.lineItems),
            duration: "Duration pending",
            destination: "Destination pending",
            primaryCommercialMessage: result.warnings[0] ?? stageMessage(result.metadata.stages),
        });
        const breakdown = (0, models_1.createPricingBreakdownPresentationModel)({
            accommodationSubtotal: amountByCode(pricing.breakdown.lineItems, "ACCOMMODATION"),
            experiencesSubtotal: amountByCode(pricing.breakdown.lineItems, "EXPERIENCE"),
            taxes: pricing.totals.taxTotal.amount,
            fees: pricing.totals.feeTotal.amount,
            discounts: pricing.totals.discountTotal.amount,
            markups: pricing.totals.markupTotal.amount,
            commissions: pricing.totals.commissionTotal.amount,
            grandTotal: pricing.totals.grandTotal.amount,
            currency: pricing.currency,
        });
        const expiresAt = new Date(pricing.metadata.createdAt.getTime());
        expiresAt.setDate(expiresAt.getDate() + 7);
        const quote = (0, models_1.createQuotePresentationModel)({
            quoteStatus: "DRAFT",
            validityPeriod: "7 days",
            expiresAt,
            commercialNotes: result.warnings,
            quotationReference: pricing.identity.id,
        });
        return Object.freeze({
            summary,
            breakdown,
            quote,
        });
    }
}
exports.PricingPresentationMapper = PricingPresentationMapper;
//# sourceMappingURL=pricing-presentation-mapper.js.map
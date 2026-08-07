"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuoteFactory = void 0;
const models_1 = require("../models");
const models_2 = require("./models");
function resolveQuotationNumber(context) {
    if (context.quotationMetadata.quotationNumber) {
        return context.quotationMetadata.quotationNumber;
    }
    return `Q-${context.metadata.requestId}-${context.createdAt.getTime()}`;
}
function resolveExpiresAt(createdAt, validityDays) {
    const expiresAt = new Date(createdAt.getTime());
    expiresAt.setDate(expiresAt.getDate() + (validityDays ?? 7));
    return expiresAt;
}
class QuoteFactory {
    create(context) {
        if (!context.pricingEngineResult.successful || !context.pricingEngineResult.pricing) {
            throw new Error("Cannot create quote from unsuccessful pricing result.");
        }
        const pricing = context.pricingEngineResult.pricing;
        const quoteReference = (0, models_2.createQuoteReference)({
            quotationNumber: resolveQuotationNumber(context),
            externalReference: context.quotationMetadata.externalReference,
            customerReference: context.quotationMetadata.customerReference,
        });
        const expiresAt = resolveExpiresAt(context.createdAt, context.quotationMetadata.validityDays);
        const lifecycle = (0, models_2.createQuoteLifecycle)({
            createdAt: context.createdAt,
            expiresAt,
        });
        const quote = (0, models_1.createQuote)({
            id: quoteReference.quotationNumber,
            status: models_1.QuoteStatus.DRAFT,
            items: pricing.breakdown.lineItems.map((lineItem) => (0, models_1.createQuoteItem)({
                code: lineItem.code,
                label: lineItem.label,
                amount: lineItem.totalAmount,
                quantity: lineItem.quantity,
            })),
            total: pricing.totals.grandTotal,
            metadata: (0, models_1.createQuoteMetadata)({
                createdAt: lifecycle.createdAt,
                expiresAt: lifecycle.expiresAt,
                version: "1.0.0",
                source: context.quotationMetadata.source ?? "QuoteFactory",
            }),
        });
        return Object.freeze({
            quote,
            quoteReference,
            lifecycle,
        });
    }
}
exports.QuoteFactory = QuoteFactory;
//# sourceMappingURL=quote-factory.js.map
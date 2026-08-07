"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createQuoteContext = createQuoteContext;
function normalizeValidityDays(validityDays) {
    if (typeof validityDays !== "number" || !Number.isFinite(validityDays) || validityDays <= 0) {
        return 7;
    }
    return Math.floor(validityDays);
}
function createPricingSummary(result) {
    const pricing = result.pricing;
    if (!pricing) {
        return Object.freeze({
            currency: "UNSPECIFIED",
            subtotal: 0,
            taxes: 0,
            discounts: 0,
            total: 0,
        });
    }
    return Object.freeze({
        currency: pricing.currency,
        subtotal: pricing.totals.subtotal.amount,
        taxes: pricing.totals.taxTotal.amount,
        discounts: pricing.totals.discountTotal.amount,
        total: pricing.totals.grandTotal.amount,
    });
}
function createQuoteContext(request) {
    const quotationMetadata = request.quotationMetadata ?? {};
    return Object.freeze({
        pricingEngineResult: request.pricingEngineResult,
        travellerSummary: Object.freeze({
            travellerCount: request.travellerSummary.travellerCount,
            leadTravellerName: request.travellerSummary.leadTravellerName,
        }),
        journeySummary: Object.freeze({
            journeyId: request.journeySummary.journeyId,
            title: request.journeySummary.title,
            destination: request.journeySummary.destination,
            duration: request.journeySummary.duration,
        }),
        pricingSummary: createPricingSummary(request.pricingEngineResult),
        quotationMetadata: Object.freeze({
            quotationNumber: quotationMetadata.quotationNumber,
            externalReference: quotationMetadata.externalReference,
            customerReference: quotationMetadata.customerReference,
            validityDays: normalizeValidityDays(quotationMetadata.validityDays),
            source: quotationMetadata.source,
        }),
        createdAt: new Date(),
        metadata: Object.freeze({
            version: "1.0.0",
            requestId: request.requestId ?? request.pricingEngineResult.metadata.requestId,
            source: request.source ?? "QuoteIntegrationService",
        }),
    });
}
//# sourceMappingURL=quote-context.js.map
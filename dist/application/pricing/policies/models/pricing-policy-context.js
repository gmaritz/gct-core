"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPricingPolicyContext = createPricingPolicyContext;
function createPricingPolicyContext(context) {
    return Object.freeze({
        pricingRequest: context.pricingRequest,
        journeySummary: Object.freeze({
            journeyId: context.journeySummary.journeyId,
            productType: context.journeySummary.productType,
            destination: context.journeySummary.destination,
        }),
        travellerInformation: Object.freeze({
            travellerCount: context.travellerInformation.travellerCount,
            residentCountry: context.travellerInformation.residentCountry,
        }),
        commercialMetadata: Object.freeze({ ...context.commercialMetadata }),
        market: context.market,
        salesChannel: context.salesChannel,
        bookingDate: new Date(context.bookingDate.getTime()),
    });
}
//# sourceMappingURL=pricing-policy-context.js.map
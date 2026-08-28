"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultJourneyQuoteService = void 0;
exports.createDefaultPricingEngine = createDefaultPricingEngine;
const journeys_1 = require("../../../journeys");
const pricing_1 = require("../../../pricing");
const pricing_2 = require("../../../pricing");
function createDefaultPricingEngine() {
    return new pricing_1.PricingEngine(new pricing_2.PricingValidationPipeline({
        requestValidator: new pricing_2.PricingRequestValidator(),
        commercialValidator: new pricing_2.CommercialValidator(),
        integrityValidator: new pricing_2.PricingIntegrityValidator(),
        quoteReadinessValidator: new pricing_2.QuoteReadinessValidator(),
    }), new pricing_2.PricingPolicyPipeline(), new pricing_2.PricingCalculatorPipeline());
}
function createPricingRequest(journey, amounts) {
    const total = amounts.reduce((sum, amount) => sum + amount, 0);
    const currency = pricing_1.Currency.ZAR;
    const lineItems = amounts.map((amount, index) => (0, pricing_1.createPricingLineItem)({
        code: `ACCOMMODATION:${index + 1}`,
        label: `Accommodation ${index + 1}`,
        unitAmount: (0, pricing_1.createMoney)({ amount, currency }),
        totalAmount: (0, pricing_1.createMoney)({ amount, currency }),
        quantity: 1,
    }));
    return {
        requestId: `quote-${journey.identity.id}`,
        travellerCount: 2,
        destination: journey.destinations[0]?.name,
        market: "ZA",
        salesChannel: "DIRECT",
        pricingRequest: {
            currency,
            summary: (0, pricing_1.createPricingSummary)({
                productId: journey.identity.id,
                productType: "DYNAMIC_HOMEPAGE_JOURNEY",
                description: `${journey.classification.category} journey`,
            }),
            breakdown: (0, pricing_1.createPricingBreakdown)({ lineItems }),
            taxes: (0, pricing_1.createTaxBreakdown)({
                entries: [(0, pricing_1.createTax)({
                        code: "VAT",
                        type: pricing_1.TaxType.VAT,
                        amount: (0, pricing_1.createMoney)({ amount: 0, currency }),
                    })],
                total: (0, pricing_1.createMoney)({ amount: 0, currency }),
            }),
            fees: [(0, pricing_1.createFee)({
                    code: "SERVICE_FEE",
                    label: "Service fee",
                    amount: (0, pricing_1.createMoney)({ amount: 0, currency }),
                })],
            discounts: [],
            markups: [],
            commissions: [],
            promotions: [],
            totals: (0, pricing_1.createPricingTotal)({
                subtotal: (0, pricing_1.createMoney)({ amount: total, currency }),
                taxTotal: (0, pricing_1.createMoney)({ amount: 0, currency }),
                feeTotal: (0, pricing_1.createMoney)({ amount: 0, currency }),
                discountTotal: (0, pricing_1.createMoney)({ amount: 0, currency }),
                markupTotal: (0, pricing_1.createMoney)({ amount: 0, currency }),
                commissionTotal: (0, pricing_1.createMoney)({ amount: 0, currency }),
                grandTotal: (0, pricing_1.createMoney)({ amount: total, currency }),
            }),
        },
    };
}
class DefaultJourneyQuoteService {
    constructor(resolver, pricingEngine) {
        this.resolver = resolver;
        this.pricingEngine = pricingEngine;
    }
    async priceJourney(journeyId, selections) {
        const resolution = await this.resolver.resolve(journeyId);
        if (resolution.status !== "RESOLVED" || !resolution.journey) {
            return { status: resolution.status === "RESOLVED" ? "UNAVAILABLE" : resolution.status, journeyId, selections };
        }
        if (selections.length !== resolution.journey.accommodation.length) {
            return { status: "INVALID", journeyId, journey: resolution.journey, selections };
        }
        const amounts = [];
        for (const selection of selections) {
            const option = resolution.journey.accommodation.find((candidate) => candidate.accommodationId === selection.accommodationId
                && (!selection.stopId || candidate.packageStop?.stopId === selection.stopId));
            const room = option?.roomOptions?.find((candidate) => candidate.reference.provider === selection.roomReference.provider
                && candidate.reference.opaqueReference === selection.roomReference.opaqueReference);
            const rate = room?.rateOptions.find((candidate) => candidate.reference.provider === selection.rateReference.provider
                && candidate.reference.opaqueReference === selection.rateReference.opaqueReference);
            if (!option || !room || !rate) {
                return { status: "INVALID", journeyId, journey: resolution.journey, selections };
            }
            if (rate.status !== "BOOKABLE") {
                return { status: "RECHECK_REQUIRED", journeyId, journey: resolution.journey, selections };
            }
            (0, journeys_1.selectJourneyAccommodation)(option, {
                accommodationId: selection.accommodationId,
                packageStopId: selection.stopId,
                roomReference: selection.roomReference,
                rateReference: selection.rateReference,
            });
            amounts.push(rate.pricing.amount);
        }
        const pricing = await this.pricingEngine.execute(createPricingRequest(resolution.journey, amounts));
        return {
            status: pricing.successful && pricing.pricing ? "PRICED" : "UNAVAILABLE",
            journeyId,
            journey: resolution.journey,
            pricing,
            selections,
        };
    }
    async priceCurrentJourney(journeyId) {
        const resolution = await this.resolver.resolve(journeyId);
        if (resolution.status !== "RESOLVED" || !resolution.journey) {
            return { status: resolution.status === "RESOLVED" ? "UNAVAILABLE" : resolution.status, journeyId, selections: [] };
        }
        const selections = resolution.journey.accommodation.flatMap((option) => {
            const room = option.roomOptions?.[0];
            const rate = room?.rateOptions[0];
            return room && rate ? [{
                    accommodationId: option.accommodationId,
                    roomReference: room.reference,
                    rateReference: rate.reference,
                }] : [];
        });
        return this.priceJourney(journeyId, selections);
    }
}
exports.DefaultJourneyQuoteService = DefaultJourneyQuoteService;
//# sourceMappingURL=journey-quote-service.js.map
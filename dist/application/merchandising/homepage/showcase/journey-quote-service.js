"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultJourneyQuoteService = void 0;
exports.createDefaultPricingEngine = createDefaultPricingEngine;
const journeys_1 = require("../../../journeys");
const pricing_1 = require("../../../pricing");
const journey_selection_store_1 = require("./journey-selection-store");
const pricing_2 = require("../../../pricing");
function createDefaultPricingEngine() {
    return new pricing_1.PricingEngine(new pricing_2.PricingValidationPipeline({
        requestValidator: new pricing_2.PricingRequestValidator(),
        commercialValidator: new pricing_2.CommercialValidator(),
        integrityValidator: new pricing_2.PricingIntegrityValidator(),
        quoteReadinessValidator: new pricing_2.QuoteReadinessValidator(),
    }), new pricing_2.PricingPolicyPipeline(), new pricing_2.PricingCalculatorPipeline());
}
function createPricingRequest(journey, pricingInputs, travellerCount) {
    const currency = pricing_1.Currency.ZAR;
    const baseRequest = {
        currency,
        summary: (0, pricing_1.createPricingSummary)({
            productId: journey.identity.id,
            productType: "DYNAMIC_HOMEPAGE_JOURNEY",
            description: `${journey.classification.category} journey`,
        }),
        breakdown: (0, pricing_1.createPricingBreakdown)({
            lineItems: [(0, pricing_1.createPricingLineItem)({
                    code: "BASE",
                    label: "Base package",
                    unitAmount: (0, pricing_1.createMoney)({ amount: 0, currency }),
                    totalAmount: (0, pricing_1.createMoney)({ amount: 0, currency }),
                    quantity: 1,
                })],
        }),
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
            subtotal: (0, pricing_1.createMoney)({ amount: 0, currency }),
            taxTotal: (0, pricing_1.createMoney)({ amount: 0, currency }),
            feeTotal: (0, pricing_1.createMoney)({ amount: 0, currency }),
            discountTotal: (0, pricing_1.createMoney)({ amount: 0, currency }),
            markupTotal: (0, pricing_1.createMoney)({ amount: 0, currency }),
            commissionTotal: (0, pricing_1.createMoney)({ amount: 0, currency }),
            grandTotal: (0, pricing_1.createMoney)({ amount: 0, currency }),
        }),
    };
    return {
        requestId: `quote-${journey.identity.id}`,
        travellerCount,
        destination: journey.destinations[0]?.name,
        market: "ZA",
        salesChannel: "DIRECT",
        pricingRequest: (0, pricing_1.withAccommodationPricingInputs)(baseRequest, pricingInputs),
    };
}
class DefaultJourneyQuoteService {
    constructor(resolver, pricingEngine, selectionStore = journey_selection_store_1.journeySelectionStore) {
        this.resolver = resolver;
        this.pricingEngine = pricingEngine;
        this.selectionStore = selectionStore;
    }
    async priceJourney(journeyId, selections) {
        const resolution = await this.resolver.resolve(journeyId);
        if (resolution.status !== "RESOLVED" || !resolution.journey) {
            return { status: resolution.status === "RESOLVED" ? "UNAVAILABLE" : resolution.status, journeyId, selections };
        }
        if (selections.length !== resolution.journey.accommodation.length) {
            return { status: "INVALID", journeyId, journey: resolution.journey, selections };
        }
        const pricingInputs = [];
        let travellerCount = 0;
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
            const selected = (0, journeys_1.selectJourneyAccommodation)(option, {
                accommodationId: selection.accommodationId,
                packageStopId: selection.stopId,
                roomReference: selection.roomReference,
                rateReference: selection.rateReference,
            });
            const pricingInput = selected.pricingInput;
            if (!pricingInput) {
                return { status: "INVALID", journeyId, journey: resolution.journey, selections };
            }
            pricingInputs.push(pricingInput);
            travellerCount += (pricingInput.occupancy ?? rate.occupancy ?? option.requestedOccupancy)?.rooms
                .reduce((total, roomOccupancy) => total + roomOccupancy.adults + roomOccupancy.children, 0) ?? 0;
        }
        const pricing = await this.pricingEngine.execute(createPricingRequest(resolution.journey, pricingInputs, travellerCount));
        return {
            status: pricing.successful && pricing.pricing ? "PRICED" : "UNAVAILABLE",
            journeyId,
            journey: resolution.journey,
            pricing,
            selections,
        };
    }
    async priceCurrentJourney(journeyId) {
        return this.priceJourney(journeyId, this.selectionStore.find(journeyId));
    }
}
exports.DefaultJourneyQuoteService = DefaultJourneyQuoteService;
//# sourceMappingURL=journey-quote-service.js.map
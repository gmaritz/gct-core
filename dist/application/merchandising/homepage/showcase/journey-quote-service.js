"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultJourneyQuoteService = void 0;
exports.createDefaultPricingEngine = createDefaultPricingEngine;
const journeys_1 = require("../../../journeys");
const pricing_1 = require("../../../pricing");
const journey_selection_store_1 = require("./journey-selection-store");
const journey_state_ownership_1 = require("./journey-state-ownership");
const cape_winelands_journey_resolver_1 = require("./cape-winelands-journey-resolver");
const pricing_2 = require("../../../pricing");
function createDefaultPricingEngine() {
    return new pricing_1.PricingEngine(new pricing_2.PricingValidationPipeline({
        requestValidator: new pricing_2.PricingRequestValidator(),
        commercialValidator: new pricing_2.CommercialValidator(),
        integrityValidator: new pricing_2.PricingIntegrityValidator(),
        quoteReadinessValidator: new pricing_2.QuoteReadinessValidator(),
    }), new pricing_2.PricingPolicyPipeline(), new pricing_2.PricingCalculatorPipeline());
}
const groupTotals = {
    2: 51376,
    3: 64260,
    4: 73680,
    5: 83100,
    6: 95160,
    7: 106190,
    8: 115680,
};
function groupTotalFor(journey, travellerCount) {
    const hasCapeWinelandsSupplierOffers = journey.identity.id === cape_winelands_journey_resolver_1.CAPE_WINELANDS_JOURNEY_ID
        && journey.accommodation.some((option) => option.provider === "hotelbeds");
    return hasCapeWinelandsSupplierOffers
        ? groupTotals[travellerCount] ?? 0
        : 0;
}
// The accommodation currency cannot be safely combined with the ZAR group component: no total is produced.
function currencyUnconfirmed(journeyId, journey, selections, travellerCount) {
    const amount = groupTotalFor(journey, travellerCount);
    return {
        status: "CURRENCY_UNCONFIRMED",
        journeyId,
        journey,
        selections,
        groupComponent: amount > 0 ? { amount, currency: pricing_1.Currency.ZAR } : undefined,
    };
}
function createPricingRequest(journey, pricingInputs, travellerCount) {
    const currency = pricing_1.Currency.ZAR;
    const groupTotal = groupTotalFor(journey, travellerCount);
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
                    label: journey.identity.id === cape_winelands_journey_resolver_1.CAPE_WINELANDS_JOURNEY_ID ? "Go Cape Tours journey component" : "Base package",
                    unitAmount: (0, pricing_1.createMoney)({ amount: groupTotal, currency }),
                    totalAmount: (0, pricing_1.createMoney)({ amount: groupTotal, currency }),
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
            subtotal: (0, pricing_1.createMoney)({ amount: groupTotal, currency }),
            taxTotal: (0, pricing_1.createMoney)({ amount: 0, currency }),
            feeTotal: (0, pricing_1.createMoney)({ amount: 0, currency }),
            discountTotal: (0, pricing_1.createMoney)({ amount: 0, currency }),
            markupTotal: (0, pricing_1.createMoney)({ amount: 0, currency }),
            commissionTotal: (0, pricing_1.createMoney)({ amount: 0, currency }),
            grandTotal: (0, pricing_1.createMoney)({ amount: groupTotal, currency }),
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
    async priceJourney(ownerId, journeyId, selections) {
        (0, journey_state_ownership_1.assertJourneyStateOwner)(ownerId);
        const resolution = await this.resolver.resolve(ownerId, journeyId);
        if (resolution.status !== "RESOLVED" || !resolution.journey) {
            return { status: resolution.status === "RESOLVED" ? "UNAVAILABLE" : resolution.status, journeyId, selections };
        }
        const expectedStops = new Set(resolution.journey.accommodation.map((option, index) => option.packageStop?.stopId ?? `legacy-stop-${index + 1}`));
        if (selections.length !== expectedStops.size) {
            return { status: "INVALID", journeyId, journey: resolution.journey, selections };
        }
        const pricingInputs = [];
        let travellerCount = 0;
        const selectedStopIds = new Set();
        for (const selection of selections) {
            const option = resolution.journey.accommodation.find((candidate) => candidate.accommodationId === selection.accommodationId
                && (!selection.stopId || candidate.packageStop?.stopId === selection.stopId));
            const roomSelections = selection.roomSelections ?? (selection.roomReference && selection.rateReference
                ? [{ roomReference: selection.roomReference, rateReference: selection.rateReference }]
                : []);
            if (roomSelections.length === 0) {
                return { status: "INVALID", journeyId, journey: resolution.journey, selections };
            }
            const selectedRoomRates = roomSelections.map((roomSelection) => {
                const room = option?.roomOptions?.find((candidate) => candidate.reference.provider === roomSelection.roomReference.provider
                    && candidate.reference.opaqueReference === roomSelection.roomReference.opaqueReference);
                const rate = room?.rateOptions.find((candidate) => candidate.reference.provider === roomSelection.rateReference.provider
                    && candidate.reference.opaqueReference === roomSelection.rateReference.opaqueReference);
                return room && rate ? { room, rate } : undefined;
            });
            const room = selectedRoomRates[0]?.room;
            const rate = selectedRoomRates[0]?.rate;
            if (!option || !room || !rate || selectedRoomRates.some((item) => !item)) {
                return { status: "INVALID", journeyId, journey: resolution.journey, selections };
            }
            const stopId = option.packageStop?.stopId ?? selection.stopId ?? option.accommodationId;
            if (selectedStopIds.has(stopId)) {
                return { status: "INVALID", journeyId, journey: resolution.journey, selections };
            }
            selectedStopIds.add(stopId);
            if (selectedRoomRates.some((item) => item.rate.status !== "BOOKABLE")) {
                return { status: "RECHECK_REQUIRED", journeyId, journey: resolution.journey, selections };
            }
            // Room rates of one stop in different currencies cannot be summed into a single stop price.
            if (selectedRoomRates.some((item) => item.rate.pricing.currency !== rate.pricing.currency)) {
                const requestedTravellers = option.requestedOccupancy?.rooms
                    .reduce((total, roomOccupancy) => total + roomOccupancy.adults + roomOccupancy.children, 0) ?? 0;
                return currencyUnconfirmed(journeyId, resolution.journey, selections, requestedTravellers);
            }
            const selected = (0, journeys_1.selectJourneyAccommodation)(option, {
                accommodationId: selection.accommodationId,
                packageStopId: selection.stopId,
                roomReference: roomSelections[0].roomReference,
                rateReference: roomSelections[0].rateReference,
                roomSelections,
            });
            const pricingInput = selected.pricingInput;
            if (!pricingInput) {
                return { status: "INVALID", journeyId, journey: resolution.journey, selections };
            }
            pricingInputs.push(pricingInput);
            const allocatedTravellerCount = (pricingInput.occupancy ?? rate.occupancy ?? option.requestedOccupancy)?.rooms
                .reduce((total, roomOccupancy) => total + roomOccupancy.adults + roomOccupancy.children, 0) ?? 0;
            if (travellerCount !== 0 && travellerCount !== allocatedTravellerCount) {
                return { status: "INVALID", journeyId, journey: resolution.journey, selections };
            }
            travellerCount = allocatedTravellerCount;
        }
        if (selectedStopIds.size !== expectedStops.size) {
            return { status: "INVALID", journeyId, journey: resolution.journey, selections };
        }
        let pricingRequest;
        try {
            pricingRequest = createPricingRequest(resolution.journey, pricingInputs, travellerCount);
        }
        catch (error) {
            if (error instanceof pricing_1.AccommodationCurrencyError) {
                return currencyUnconfirmed(journeyId, resolution.journey, selections, travellerCount);
            }
            throw error;
        }
        const pricing = await this.pricingEngine.execute(pricingRequest);
        return {
            status: pricing.successful && pricing.pricing ? "PRICED" : "UNAVAILABLE",
            journeyId,
            journey: resolution.journey,
            pricing,
            selections,
        };
    }
    async priceCurrentJourney(ownerId, journeyId) {
        return this.priceJourney(ownerId, journeyId, this.selectionStore.find(ownerId, journeyId));
    }
}
exports.DefaultJourneyQuoteService = DefaultJourneyQuoteService;
//# sourceMappingURL=journey-quote-service.js.map
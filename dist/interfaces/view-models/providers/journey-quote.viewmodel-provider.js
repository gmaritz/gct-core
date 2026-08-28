"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JourneyQuoteViewModelProvider = void 0;
const pricing_1 = require("../../../application/pricing");
class JourneyQuoteViewModelProvider {
    constructor(pricingProvider = new pricing_1.PricingViewModelProvider()) {
        this.pricingProvider = pricingProvider;
    }
    provide(result) {
        const journey = result.journey;
        const pricing = result.pricing?.successful ? this.pricingProvider.mapPricingResultToViewModel(result.pricing) ?? undefined : undefined;
        const accommodation = journey?.accommodation.map((option) => {
            const room = option.roomOptions?.[0];
            const rate = room?.rateOptions[0];
            return Object.freeze({
                property: option.name,
                room: room?.name ?? "Room unavailable",
                rate: rate?.board?.name ?? "Rate unavailable",
                amount: rate?.pricing.amount ?? 0,
                currency: rate?.pricing.currency ?? "UNSPECIFIED",
            });
        }) ?? [];
        const message = result.status === "PRICED"
            ? "This quote reflects the current selected accommodation configuration."
            : result.status === "RECHECK_REQUIRED"
                ? "The selected rate needs to be checked again before pricing can continue."
                : result.status === "UNAVAILABLE"
                    ? "This journey or its accommodation is no longer available."
                    : "The selected journey or accommodation configuration could not be resolved.";
        return Object.freeze({
            journeyId: result.journeyId,
            journeyTitle: journey ? `${journey.classification.category} ${journey.destinations[0]?.name ?? "Journey"} Journey` : "Journey unavailable",
            status: result.status,
            accommodation: Object.freeze(accommodation),
            pricing,
            message,
            recoveryHref: `/ui/journeys/${result.journeyId}/accommodation`,
        });
    }
}
exports.JourneyQuoteViewModelProvider = JourneyQuoteViewModelProvider;
//# sourceMappingURL=journey-quote.viewmodel-provider.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultReservationReviewService = void 0;
const guest_information_service_1 = require("./guest-information-service");
const guest_information_store_1 = require("./guest-information-store");
const journey_state_ownership_1 = require("./journey-state-ownership");
const dynamic_homepage_journey_resolver_1 = require("./dynamic-homepage-journey-resolver");
const journey_quote_service_1 = require("./journey-quote-service");
class DefaultReservationReviewService {
    constructor(resolver = new dynamic_homepage_journey_resolver_1.DefaultDynamicHomepageJourneyResolver(), guestService = new guest_information_service_1.DefaultGuestInformationService(resolver), quoteService = new journey_quote_service_1.DefaultJourneyQuoteService(resolver, (0, journey_quote_service_1.createDefaultPricingEngine)()), guestStore = guest_information_store_1.guestInformationStore) {
        this.resolver = resolver;
        this.guestService = guestService;
        this.quoteService = quoteService;
        this.guestStore = guestStore;
    }
    async review(request) {
        (0, journey_state_ownership_1.assertJourneyStateOwner)(request.ownerId);
        const resolution = await this.resolver.resolve(request.ownerId, request.journeyId);
        if (resolution.status !== "RESOLVED" || !resolution.journey) {
            return {
                status: "UNAVAILABLE",
                journeyId: request.journeyId,
                errors: ["The journey is no longer available."],
                confirmed: false,
            };
        }
        const guestInformation = this.guestStore.find(request.ownerId, request.journeyId);
        if (!guestInformation) {
            return {
                status: "INVALID",
                journeyId: request.journeyId,
                journey: resolution.journey,
                errors: ["Complete guest information before reviewing the reservation."],
                confirmed: false,
            };
        }
        const guest = await this.guestService.captureGuestInformation(request.ownerId, request.journeyId, guestInformation);
        if (guest.status !== "VALID") {
            return {
                status: "INVALID",
                journeyId: request.journeyId,
                journey: resolution.journey,
                guestInformation,
                errors: guest.errors,
                confirmed: false,
            };
        }
        const quote = await this.quoteService.priceCurrentJourney(request.ownerId, request.journeyId);
        if (quote.status === "RECHECK_REQUIRED") {
            return { status: "RECHECK_REQUIRED", journeyId: request.journeyId, journey: resolution.journey, quote, guestInformation, errors: ["The current quote requires revalidation."], confirmed: false };
        }
        if (quote.status !== "PRICED") {
            const errors = quote.status === "CURRENCY_UNCONFIRMED"
                ? ["A final package price is unavailable until the accommodation currency is confirmed."]
                : ["The current quote is unavailable."];
            return { status: "UNAVAILABLE", journeyId: request.journeyId, journey: resolution.journey, quote, guestInformation, errors, confirmed: false };
        }
        return {
            status: "READY",
            journeyId: request.journeyId,
            journey: resolution.journey,
            quote,
            guestInformation,
            errors: [],
            confirmed: request.confirmed === true,
        };
    }
}
exports.DefaultReservationReviewService = DefaultReservationReviewService;
//# sourceMappingURL=reservation-review-service.js.map
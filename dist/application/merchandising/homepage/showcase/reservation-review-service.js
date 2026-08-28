"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultReservationReviewService = void 0;
const guest_information_service_1 = require("./guest-information-service");
const dynamic_homepage_journey_resolver_1 = require("./dynamic-homepage-journey-resolver");
const journey_quote_service_1 = require("./journey-quote-service");
class DefaultReservationReviewService {
    constructor(resolver = new dynamic_homepage_journey_resolver_1.DefaultDynamicHomepageJourneyResolver(), guestService = new guest_information_service_1.DefaultGuestInformationService(resolver), quoteService = new journey_quote_service_1.DefaultJourneyQuoteService(resolver, (0, journey_quote_service_1.createDefaultPricingEngine)())) {
        this.resolver = resolver;
        this.guestService = guestService;
        this.quoteService = quoteService;
    }
    async review(request) {
        const resolution = await this.resolver.resolve(request.journeyId);
        if (resolution.status !== "RESOLVED" || !resolution.journey) {
            return {
                status: "UNAVAILABLE",
                journeyId: request.journeyId,
                errors: ["The journey is no longer available."],
                confirmed: false,
            };
        }
        const guest = await this.guestService.captureGuestInformation(request.journeyId, request.guestInformation);
        if (guest.status !== "VALID") {
            return {
                status: "INVALID",
                journeyId: request.journeyId,
                journey: resolution.journey,
                guestInformation: request.guestInformation,
                errors: guest.errors,
                confirmed: false,
            };
        }
        const quote = await this.quoteService.priceCurrentJourney(request.journeyId);
        if (quote.status === "RECHECK_REQUIRED") {
            return { status: "RECHECK_REQUIRED", journeyId: request.journeyId, journey: resolution.journey, quote, guestInformation: request.guestInformation, errors: ["The current quote requires revalidation."], confirmed: false };
        }
        if (quote.status !== "PRICED") {
            return { status: "UNAVAILABLE", journeyId: request.journeyId, journey: resolution.journey, quote, guestInformation: request.guestInformation, errors: ["The current quote is unavailable."], confirmed: false };
        }
        return {
            status: "READY",
            journeyId: request.journeyId,
            journey: resolution.journey,
            quote,
            guestInformation: request.guestInformation,
            errors: [],
            confirmed: request.confirmed === true,
        };
    }
}
exports.DefaultReservationReviewService = DefaultReservationReviewService;
//# sourceMappingURL=reservation-review-service.js.map
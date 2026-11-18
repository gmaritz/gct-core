"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultReservationReviewService = exports.reservationReviewAcceptanceStore = exports.ReservationReviewAcceptanceStore = void 0;
const crypto_1 = require("crypto");
const guest_information_service_1 = require("./guest-information-service");
const guest_information_store_1 = require("./guest-information-store");
const journey_state_ownership_1 = require("./journey-state-ownership");
const dynamic_homepage_journey_resolver_1 = require("./dynamic-homepage-journey-resolver");
const journey_quote_service_1 = require("./journey-quote-service");
const signature_cape_winelands_initial_payment_calculator_1 = require("./signature-cape-winelands-initial-payment-calculator");
const cape_winelands_journey_resolver_1 = require("./cape-winelands-journey-resolver");
const signature_cape_winelands_payment_policy_1 = require("./signature-cape-winelands-payment-policy");
class ReservationReviewAcceptanceStore {
    constructor(lifetimeMilliseconds = 30 * 60 * 1000) {
        this.lifetimeMilliseconds = lifetimeMilliseconds;
        this.acceptances = new Map();
    }
    issue(ownerId, journeyId, fingerprint, now = Date.now()) {
        for (const [token, acceptance] of this.acceptances) {
            if (acceptance.expiresAt <= now)
                this.acceptances.delete(token);
        }
        const token = (0, crypto_1.randomUUID)();
        this.acceptances.set(token, { ownerId, journeyId, fingerprint, expiresAt: now + this.lifetimeMilliseconds });
        return token;
    }
    matches(token, ownerId, journeyId, fingerprint, now = Date.now()) {
        if (!token)
            return false;
        const acceptance = this.acceptances.get(token);
        if (!acceptance)
            return false;
        if (acceptance.expiresAt <= now) {
            this.acceptances.delete(token);
            return false;
        }
        return acceptance.ownerId === ownerId
            && acceptance.journeyId === journeyId
            && acceptance.fingerprint === fingerprint;
    }
    consume(token, ownerId, journeyId) {
        if (!token)
            return;
        const acceptance = this.acceptances.get(token);
        if (acceptance?.ownerId === ownerId && acceptance.journeyId === journeyId) {
            this.acceptances.delete(token);
        }
    }
}
exports.ReservationReviewAcceptanceStore = ReservationReviewAcceptanceStore;
exports.reservationReviewAcceptanceStore = new ReservationReviewAcceptanceStore();
function reviewFingerprint(journeyId, quote, guestInformation, initialPaymentRequirement) {
    const pricing = quote.pricing?.pricing;
    const payload = {
        journeyId,
        selections: quote.selections.map((selection) => ({
            stopId: selection.stopId,
            accommodationId: selection.accommodationId,
            roomSelections: selection.roomSelections ?? (selection.roomReference && selection.rateReference
                ? [{ roomReference: selection.roomReference, rateReference: selection.rateReference }]
                : []),
        })),
        pricing: pricing ? {
            identity: pricing.identity.id,
            currency: pricing.currency,
            totals: pricing.totals,
            lineItems: pricing.breakdown.lineItems.map((line) => ({
                code: line.code,
                quantity: line.quantity,
                unitAmount: line.unitAmount,
                totalAmount: line.totalAmount,
                metadata: Object.entries(line.metadata ?? {}).sort(([left], [right]) => left.localeCompare(right)),
            })),
        } : undefined,
        guestInformation,
        initialPaymentRequirement,
    };
    return (0, crypto_1.createHash)("sha256").update(JSON.stringify(payload)).digest("hex");
}
class DefaultReservationReviewService {
    constructor(resolver = new dynamic_homepage_journey_resolver_1.DefaultDynamicHomepageJourneyResolver(), guestService = new guest_information_service_1.DefaultGuestInformationService(resolver), quoteService = new journey_quote_service_1.DefaultJourneyQuoteService(resolver, (0, journey_quote_service_1.createDefaultPricingEngine)()), guestStore = guest_information_store_1.guestInformationStore, acceptanceStore = exports.reservationReviewAcceptanceStore, now = () => new Date()) {
        this.resolver = resolver;
        this.guestService = guestService;
        this.quoteService = quoteService;
        this.guestStore = guestStore;
        this.acceptanceStore = acceptanceStore;
        this.now = now;
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
        let initialPaymentRequirement;
        if (quote.journey?.identity.id === cape_winelands_journey_resolver_1.CAPE_WINELANDS_JOURNEY_ID) {
            try {
                const bookingDate = this.now();
                const policy = (0, signature_cape_winelands_payment_policy_1.resolveSignatureCapeWinelandsPaymentPolicy)(quote.journey.identity.id, bookingDate);
                initialPaymentRequirement = (0, signature_cape_winelands_initial_payment_calculator_1.calculateSignatureCapeWinelandsInitialPaymentRequirement)({
                    quote,
                    bookingDate,
                    policy,
                    costingSource: journey_quote_service_1.SIGNATURE_CAPE_WINELANDS_GCT_COSTING_SOURCE,
                });
            }
            catch (error) {
                return {
                    status: "UNAVAILABLE",
                    journeyId: request.journeyId,
                    journey: resolution.journey,
                    quote,
                    guestInformation,
                    errors: [error instanceof Error ? error.message : "The initial payment requirement is unavailable."],
                    confirmed: false,
                };
            }
        }
        const fingerprint = reviewFingerprint(request.journeyId, quote, guestInformation, initialPaymentRequirement);
        const accepted = request.confirmed === true
            && this.acceptanceStore.matches(request.acceptanceToken, request.ownerId, request.journeyId, fingerprint, this.now().getTime());
        const acceptanceToken = accepted
            ? request.acceptanceToken
            : this.acceptanceStore.issue(request.ownerId, request.journeyId, fingerprint, this.now().getTime());
        const errors = request.confirmed && !accepted
            ? ["The quote or payment terms have changed since your review. Review and accept the current terms to continue."]
            : [];
        return {
            status: "READY",
            journeyId: request.journeyId,
            journey: resolution.journey,
            quote,
            guestInformation,
            initialPaymentRequirement,
            acceptanceToken,
            errors,
            confirmed: accepted,
        };
    }
}
exports.DefaultReservationReviewService = DefaultReservationReviewService;
//# sourceMappingURL=reservation-review-service.js.map
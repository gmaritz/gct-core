import { GuestInformationInput, DefaultGuestInformationService } from "./guest-information-service";
import { GuestInformationStore, guestInformationStore } from "./guest-information-store";
import { assertJourneyStateOwner } from "./journey-state-ownership";
import { DefaultDynamicHomepageJourneyResolver, DynamicHomepageJourneyResolver } from "./dynamic-homepage-journey-resolver";
import { DefaultJourneyQuoteService, JourneyQuoteResult, createDefaultPricingEngine } from "./journey-quote-service";

export type ReservationReviewStatus = "READY" | "INVALID" | "RECHECK_REQUIRED" | "UNAVAILABLE";

export interface ReservationReviewRequest {
  readonly ownerId: string;
  readonly journeyId: string;
  readonly confirmed?: boolean;
}

export interface ReservationReviewResult {
  readonly status: ReservationReviewStatus;
  readonly journeyId: string;
  readonly journey?: JourneyQuoteResult["journey"];
  readonly quote?: JourneyQuoteResult;
  readonly guestInformation?: GuestInformationInput;
  readonly errors: ReadonlyArray<string>;
  readonly confirmed: boolean;
}

export interface ReservationReviewService {
  review(request: ReservationReviewRequest): Promise<ReservationReviewResult>;
}

export class DefaultReservationReviewService implements ReservationReviewService {
  public constructor(
    private readonly resolver: DynamicHomepageJourneyResolver = new DefaultDynamicHomepageJourneyResolver(),
    private readonly guestService = new DefaultGuestInformationService(resolver),
    private readonly quoteService = new DefaultJourneyQuoteService(resolver, createDefaultPricingEngine()),
    private readonly guestStore: GuestInformationStore = guestInformationStore,
  ) {}

  public async review(request: ReservationReviewRequest): Promise<ReservationReviewResult> {
    assertJourneyStateOwner(request.ownerId);
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
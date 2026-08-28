import { GuestInformationInput, DefaultGuestInformationService } from "./guest-information-service";
import { DefaultDynamicHomepageJourneyResolver } from "./dynamic-homepage-journey-resolver";
import { DefaultJourneyQuoteService, JourneyQuoteResult, createDefaultPricingEngine } from "./journey-quote-service";

export type ReservationReviewStatus = "READY" | "INVALID" | "RECHECK_REQUIRED" | "UNAVAILABLE";

export interface ReservationReviewRequest {
  readonly journeyId: string;
  readonly guestInformation: GuestInformationInput;
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
    private readonly resolver = new DefaultDynamicHomepageJourneyResolver(),
    private readonly guestService = new DefaultGuestInformationService(resolver),
    private readonly quoteService = new DefaultJourneyQuoteService(resolver, createDefaultPricingEngine()),
  ) {}

  public async review(request: ReservationReviewRequest): Promise<ReservationReviewResult> {
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
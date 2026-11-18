import { createHash, randomUUID } from "crypto";
import { GuestInformationInput, DefaultGuestInformationService } from "./guest-information-service";
import { GuestInformationStore, guestInformationStore } from "./guest-information-store";
import { assertJourneyStateOwner } from "./journey-state-ownership";
import { DefaultDynamicHomepageJourneyResolver, DynamicHomepageJourneyResolver } from "./dynamic-homepage-journey-resolver";
import {
  DefaultJourneyQuoteService,
  JourneyQuoteResult,
  SIGNATURE_CAPE_WINELANDS_GCT_COSTING_SOURCE,
  createDefaultPricingEngine,
} from "./journey-quote-service";
import {
  calculateSignatureCapeWinelandsInitialPaymentRequirement,
  InitialPaymentRequirement,
} from "./signature-cape-winelands-initial-payment-calculator";
import { CAPE_WINELANDS_JOURNEY_ID } from "./cape-winelands-journey-resolver";
import { resolveSignatureCapeWinelandsPaymentPolicy } from "./signature-cape-winelands-payment-policy";

export type ReservationReviewStatus = "READY" | "INVALID" | "RECHECK_REQUIRED" | "UNAVAILABLE";

export interface ReservationReviewRequest {
  readonly ownerId: string;
  readonly journeyId: string;
  readonly confirmed?: boolean;
  readonly acceptanceToken?: string;
}

export interface ReservationReviewResult {
  readonly status: ReservationReviewStatus;
  readonly journeyId: string;
  readonly journey?: JourneyQuoteResult["journey"];
  readonly quote?: JourneyQuoteResult;
  readonly guestInformation?: GuestInformationInput;
  readonly initialPaymentRequirement?: InitialPaymentRequirement;
  readonly acceptanceToken?: string;
  readonly errors: ReadonlyArray<string>;
  readonly confirmed: boolean;
}

export interface ReservationReviewService {
  review(request: ReservationReviewRequest): Promise<ReservationReviewResult>;
}

interface ReservationReviewAcceptance {
  readonly ownerId: string;
  readonly journeyId: string;
  readonly fingerprint: string;
  readonly expiresAt: number;
}

export class ReservationReviewAcceptanceStore {
  private readonly acceptances = new Map<string, ReservationReviewAcceptance>();

  public constructor(private readonly lifetimeMilliseconds = 30 * 60 * 1000) {}

  public issue(ownerId: string, journeyId: string, fingerprint: string, now = Date.now()): string {
    for (const [token, acceptance] of this.acceptances) {
      if (acceptance.expiresAt <= now) this.acceptances.delete(token);
    }
    const token = randomUUID();
    this.acceptances.set(token, { ownerId, journeyId, fingerprint, expiresAt: now + this.lifetimeMilliseconds });
    return token;
  }

  public matches(token: string | undefined, ownerId: string, journeyId: string, fingerprint: string, now = Date.now()): boolean {
    if (!token) return false;
    const acceptance = this.acceptances.get(token);
    if (!acceptance) return false;
    if (acceptance.expiresAt <= now) {
      this.acceptances.delete(token);
      return false;
    }
    return acceptance.ownerId === ownerId
      && acceptance.journeyId === journeyId
      && acceptance.fingerprint === fingerprint;
  }

  public consume(token: string | undefined, ownerId: string, journeyId: string): void {
    if (!token) return;
    const acceptance = this.acceptances.get(token);
    if (acceptance?.ownerId === ownerId && acceptance.journeyId === journeyId) {
      this.acceptances.delete(token);
    }
  }
}

export const reservationReviewAcceptanceStore = new ReservationReviewAcceptanceStore();

function reviewFingerprint(
  journeyId: string,
  quote: JourneyQuoteResult,
  guestInformation: GuestInformationInput,
  initialPaymentRequirement?: InitialPaymentRequirement,
): string {
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
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

export class DefaultReservationReviewService implements ReservationReviewService {
  public constructor(
    private readonly resolver: DynamicHomepageJourneyResolver = new DefaultDynamicHomepageJourneyResolver(),
    private readonly guestService = new DefaultGuestInformationService(resolver),
    private readonly quoteService = new DefaultJourneyQuoteService(resolver, createDefaultPricingEngine()),
    private readonly guestStore: GuestInformationStore = guestInformationStore,
    private readonly acceptanceStore: ReservationReviewAcceptanceStore = reservationReviewAcceptanceStore,
    private readonly now: () => Date = (): Date => new Date(),
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

    let initialPaymentRequirement: InitialPaymentRequirement | undefined;
    if (quote.journey?.identity.id === CAPE_WINELANDS_JOURNEY_ID) {
      try {
        const bookingDate = this.now();
        const policy = resolveSignatureCapeWinelandsPaymentPolicy(quote.journey.identity.id, bookingDate);
        initialPaymentRequirement = calculateSignatureCapeWinelandsInitialPaymentRequirement({
          quote,
          bookingDate,
          policy,
          costingSource: SIGNATURE_CAPE_WINELANDS_GCT_COSTING_SOURCE,
        });
      } catch (error) {
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
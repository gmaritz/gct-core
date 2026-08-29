import { JourneyQuoteResult } from "../../../application/merchandising";
import { PricingViewModelProvider } from "../../../application/pricing";
import { JourneyQuoteViewModel } from "../journeys/journey-quote.viewmodel";

export class JourneyQuoteViewModelProvider {
  public constructor(private readonly pricingProvider: PricingViewModelProvider = new PricingViewModelProvider()) {}

  public provide(result: JourneyQuoteResult): JourneyQuoteViewModel {
    const journey = result.journey;
    const pricing = result.pricing?.successful ? this.pricingProvider.mapPricingResultToViewModel(result.pricing) ?? undefined : undefined;
    const accommodation = result.selections.map((selection) => {
      const option = journey?.accommodation.find((candidate) => candidate.accommodationId === selection.accommodationId);
      const room = option?.roomOptions?.find((candidate) => candidate.reference.opaqueReference === selection.roomReference.opaqueReference);
      const rate = room?.rateOptions.find((candidate) => candidate.reference.opaqueReference === selection.rateReference.opaqueReference);
      return Object.freeze({
        property: option?.name ?? "Accommodation unavailable",
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
      journeyTitle: journey ? `${journey.classification.category} ${journey.destinations[0]?.name ?? "Journey"} Journey` : "Journey unavailable",
      status: result.status,
      accommodation: Object.freeze(accommodation),
      pricing,
      message,
      recoveryHref: `/ui/journeys/${result.journeyId}/accommodation`,
      journeyId: result.journeyId,
    });
  }
}
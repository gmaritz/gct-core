import { ReservationReviewResult } from "../../../application/merchandising";
import { PricingViewModelProvider } from "../../../application/pricing";
import { ReservationReviewViewModel } from "../journeys/reservation-review.viewmodel";

export class ReservationReviewViewModelProvider {
  private readonly pricingProvider = new PricingViewModelProvider();

  public provide(result: ReservationReviewResult): ReservationReviewViewModel {
    const journey = result.journey;
    const pricingViewModel = result.quote?.pricing?.successful && result.quote.pricing.pricing
      ? this.pricingProvider.mapPricingResultToViewModel(result.quote.pricing)
      : undefined;
    const travellerInformation = result.guestInformation?.travellers ?? [];

    return Object.freeze({
      journeyId: result.journeyId,
      journeyTitle: journey ? `${journey.classification.category} ${journey.destinations[0]?.name ?? "Journey"} Journey` : "Journey unavailable",
      destination: journey?.destinations.map((destination) => destination.name).join(" + ") ?? "Destination unavailable",
      duration: journey?.duration.description ?? "Duration unavailable",
      accommodation: Object.freeze((result.quote?.journey?.accommodation ?? journey?.accommodation ?? []).map((option, index) => Object.freeze({
        destination: journey?.destinations[index]?.name ?? journey?.destinations[0]?.name ?? "Destination unavailable",
        property: option.name,
        room: option.roomOptions?.[0]?.name ?? "Room selected",
        rate: option.roomOptions?.[0]?.rateOptions[0]?.board?.name ?? "Rate selected",
      }))),
      contact: Object.freeze({
        email: result.guestInformation?.contact.email ?? "",
        phone: result.guestInformation?.contact.phone,
      }),
      travellers: Object.freeze(travellerInformation.map((traveller) => Object.freeze({
        name: `${traveller.firstName} ${traveller.lastName}`.trim(),
        email: traveller.email,
        travellerType: traveller.travellerType,
      }))),
      quote: pricingViewModel ? Object.freeze({
        total: pricingViewModel.displayLabels.totalLabel,
        currency: pricingViewModel.summary.currency,
        breakdown: Object.freeze([
          { label: "Accommodation", value: pricingViewModel.displayLabels.totalLabel },
          { label: "Taxes", value: pricingViewModel.displayLabels.taxLabel },
          { label: "Fees", value: pricingViewModel.displayLabels.feesLabel },
          { label: "Discounts", value: pricingViewModel.displayLabels.discountsLabel },
        ].map((item) => Object.freeze(item))),
      }) : undefined,
      status: result.status,
      errors: Object.freeze([...result.errors]),
      confirmationAction: result.status === "READY"
        ? Object.freeze({ label: "Confirm and continue to payment", href: `/ui/journeys/${result.journeyId}/review`, style: "primary" })
        : undefined,
      accommodationHref: `/ui/journeys/${result.journeyId}/accommodation`,
      guestInformationHref: `/ui/journeys/${result.journeyId}/guest-information`,
    });
  }
}
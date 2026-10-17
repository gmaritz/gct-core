import { JourneyQuoteResult } from "../../../application/merchandising";
import { PricingViewModelProvider } from "../../../application/pricing";
import { JourneyQuoteViewModel } from "../journeys/journey-quote.viewmodel";

export class JourneyQuoteViewModelProvider {
  public constructor(private readonly pricingProvider: PricingViewModelProvider = new PricingViewModelProvider()) {}

  public provide(result: JourneyQuoteResult): JourneyQuoteViewModel {
    const journey = result.journey;
    const pricing = result.pricing?.successful ? this.pricingProvider.mapPricingResultToViewModel(result.pricing) ?? undefined : undefined;
    const accommodation = result.selections.map((selection) => {
      const option = journey?.accommodation.find((candidate) =>
        candidate.accommodationId === selection.accommodationId
        && (!selection.stopId || candidate.packageStop?.stopId === selection.stopId),
      );
      const roomSelections = selection.roomSelections ?? (selection.roomReference && selection.rateReference
        ? [{ roomReference: selection.roomReference, rateReference: selection.rateReference }]
        : []);
      const selectedRates = roomSelections.flatMap((roomSelection) => {
        const room = option?.roomOptions?.find((candidate) =>
          candidate.reference.provider === roomSelection.roomReference.provider
          && candidate.reference.opaqueReference === roomSelection.roomReference.opaqueReference,
        );
        const rate = room?.rateOptions.find((candidate) =>
          candidate.reference.provider === roomSelection.rateReference.provider
          && candidate.reference.opaqueReference === roomSelection.rateReference.opaqueReference,
        );
        return room && rate ? [{ room, rate }] : [];
      });
      return Object.freeze({
        stopId: option?.packageStop?.stopId,
        destination: option?.packageStop?.destination,
        checkIn: option?.packageStop?.checkInDate.toISOString().slice(0, 10),
        checkOut: option?.packageStop?.checkOutDate.toISOString().slice(0, 10),
        property: option?.name ?? "Accommodation unavailable",
        room: selectedRates.map(({ room }) => room.name).join(", ") || "Room unavailable",
        rate: selectedRates.map(({ rate }) => rate.board?.name ?? "Rate unavailable").join(", ") || "Rate unavailable",
        amount: new Set(selectedRates.map((item) => item.rate.pricing.currency)).size > 1
          ? undefined
          : selectedRates.reduce((total, item) => total + item.rate.pricing.amount, 0),
        currency: [...new Set(selectedRates.map((item) => item.rate.pricing.currency))].join(" / ") || "UNSPECIFIED",
      });
    }) ?? [];
    const groupComponent = result.pricing?.pricing?.breakdown.lineItems.find((item) => item.code === "BASE");
    const currencyUnconfirmed = result.status === "CURRENCY_UNCONFIRMED";
    const accommodationCurrencies = new Set(accommodation.map((stay) => stay.currency));
    const accommodationTotal = !currencyUnconfirmed && accommodationCurrencies.size <= 1
      ? accommodation.reduce((total, stay) => total + (stay.amount ?? 0), 0)
      : undefined;
    const selectedOption = result.selections[0]
      ? journey?.accommodation.find((candidate) =>
          candidate.accommodationId === result.selections[0]!.accommodationId
          && (!result.selections[0]!.stopId || candidate.packageStop?.stopId === result.selections[0]!.stopId),
        )
      : undefined;
    const occupancyRooms = selectedOption?.requestedOccupancy?.rooms ?? [];

    const message = result.status === "PRICED"
      ? "This quote reflects the current selected accommodation configuration."
      : result.status === "RECHECK_REQUIRED"
        ? "The selected rate needs to be checked again before pricing can continue."
        : result.status === "UNAVAILABLE"
          ? "This journey or its accommodation is no longer available."
          : result.status === "CURRENCY_UNCONFIRMED"
            ? "A final combined package price is temporarily unavailable because the accommodation currency requires confirmation."
            : "The selected journey or accommodation configuration could not be resolved.";

    return Object.freeze({
      journeyTitle: journey ? `${journey.classification.category} ${journey.destinations[0]?.name ?? "Journey"} Journey` : "Journey unavailable",
      status: result.status,
      accommodation: Object.freeze(accommodation),
      pricing,
      message,
      recoveryHref: `/ui/journeys/${result.journeyId}/accommodation`,
      journeyId: result.journeyId,
      groupComponent: groupComponent
        ? Object.freeze({ amount: groupComponent.totalAmount.amount, currency: groupComponent.totalAmount.currency })
        : result.groupComponent
          ? Object.freeze({ ...result.groupComponent })
          : undefined,
      accommodationTotal,
      participantCount: occupancyRooms.reduce((sum, room) => sum + room.adults + room.children, 0),
      roomAllocation: Object.freeze(occupancyRooms.map((room) => room.adults)),
    });
  }
}
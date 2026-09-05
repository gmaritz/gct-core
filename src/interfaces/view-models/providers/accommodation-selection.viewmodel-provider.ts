import { Journey } from "../../../application/journeys";
import { AccommodationSelectionViewModel, AccommodationStopSelectionState } from "../journeys/accommodation-selection.viewmodel";
import { ImageViewModel } from "../shared/image.viewmodel";

function createAccommodationImage(name: string, destination: string): ImageViewModel {
  const destLower = (destination || name).toLowerCase();
  let src = "/images/hero/hero-cape-town-1600x900.webp";
  if (destLower.includes("winelands")) {
    src = "/images/journeys/cape-winelands-1600x900.webp";
  } else if (destLower.includes("atlantic") || destLower.includes("seaboard")) {
    src = "/images/journeys/atlantic-seaboard-1600x900.webp";
  } else if (destLower.includes("franschhoek") || destLower.includes("valley")) {
    src = "/images/journeys/franschhoek-valley-1600x900.webp";
  }

  return Object.freeze({
    src,
    alt: `${name} - ${destination} Accommodation`,
    width: 1600,
    height: 900,
  });
}

export class AccommodationSelectionViewModelProvider {
  public provide(journey: Journey, status?: string): AccommodationSelectionViewModel {
    const destinations = journey.destinations.map((destination) => destination.name);
    const stops = journey.accommodation.map((option, index) => {
      const rooms = option.roomOptions?.map((room) => ({
        id: room.reference.opaqueReference,
        name: room.name,
        rates: room.rateOptions.map((rate) => ({
          id: rate.reference.opaqueReference,
          name: rate.board?.name,
          status: rate.status,
          amount: rate.pricing.amount,
          currency: rate.pricing.currency,
        })),
      })) ?? [];
      const selection = option.selection;
      const state: AccommodationStopSelectionState = selection
        ? "COMPLETE"
        : rooms.length > 0 ? "NOT_SELECTED" : "NOT_SELECTED";

      return Object.freeze({
        id: option.packageStop?.stopId,
        order: option.packageStop?.stopOrder ?? index + 1,
        destination: option.packageStop ? destinations[index] ?? destinations[0] ?? "" : destinations[0] ?? "",
        checkIn: option.packageStop?.checkInDate.toISOString(),
        checkOut: option.packageStop?.checkOutDate.toISOString(),
        nights: option.packageStop ? Math.max(0, Math.round((option.packageStop.checkOutDate.getTime() - option.packageStop.checkInDate.getTime()) / 86400000)) : undefined,
        occupancy: option.requestedOccupancy?.rooms,
        properties: Object.freeze([Object.freeze({
          id: option.accommodationId,
          name: option.name,
          destination: destinations[index] ?? destinations[0] ?? "",
          category: option.accommodation?.category,
          rating: option.accommodation?.rating.stars,
          image: createAccommodationImage(option.name, destinations[index] ?? destinations[0] ?? ""),
          images: Object.freeze([createAccommodationImage(option.name, destinations[index] ?? destinations[0] ?? "")]),
          rooms: Object.freeze(rooms.map((room) => Object.freeze({ ...room, rates: Object.freeze(room.rates.map((rate) => Object.freeze(rate))) }))),
        })]),
        state,
      });
    });

    const complete = stops.length > 0 && stops.every((stop) => stop.state === "COMPLETE");
    return Object.freeze({
      journeyId: journey.identity.id,
      journeyTitle: `${journey.classification.category} ${destinations[0] ?? "Journey"} Journey`,
      stops: Object.freeze(stops),
      complete,
      status,
      continuation: complete ? Object.freeze({ label: "Continue to pricing", href: "/ui/placeholder#journey-planning", style: "primary" }) : undefined,
    });
  }
}
import { GuestInformationResult } from "../../../application/merchandising";
import { GuestInformationViewModel } from "../journeys/guest-information.viewmodel";

export class GuestInformationViewModelProvider {
  public provide(result: GuestInformationResult): GuestInformationViewModel {
    const journey = result.journey;
    const information = result.information;
    const journeyTitle = journey
      ? `${journey.classification.category} ${journey.destinations[0]?.name ?? "Journey"} Journey`
      : "Journey unavailable";
    const requiredTravellerCount = journey?.accommodation[0]?.requestedOccupancy?.rooms
      .reduce((total, room) => total + room.adults + room.children, 0) ?? 0;
    const travellers = information?.travellers ?? Array.from({ length: requiredTravellerCount }, (_, index) => ({
      firstName: "",
      lastName: "",
      email: "",
      travellerType: index < (journey?.accommodation[0]?.requestedOccupancy?.rooms.reduce((total, room) => total + room.adults, 0) ?? 0) ? "ADULT" as const : "CHILD" as const,
    }));

    return Object.freeze({
      journeyId: result.journeyId,
      journeyTitle,
      contact: Object.freeze({
        email: information?.contact.email ?? "",
        phone: information?.contact.phone,
      }),
      leadTravellerIndex: information?.leadTravellerIndex ?? 0,
      travellers: Object.freeze(travellers.map((traveller) => Object.freeze({ ...traveller }))),
      errors: Object.freeze([...result.errors]),
      complete: result.status === "VALID",
      continuation: result.status === "VALID"
        ? Object.freeze({ label: "Continue to reservation review", href: `/ui/journeys/${result.journeyId}/reservation-review`, style: "primary" })
        : undefined,
    });
  }
}
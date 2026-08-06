import { JourneyAccommodation } from "../../models";

export type AccommodationCompositionResult = ReadonlyArray<JourneyAccommodation>;

export function createAccommodationCompositionResult(
  accommodations: ReadonlyArray<JourneyAccommodation>,
): AccommodationCompositionResult {
  return Object.freeze(
    accommodations.map((accommodation) =>
      Object.freeze({
        accommodationId: accommodation.accommodationId,
        name: accommodation.name,
      }),
    ),
  );
}
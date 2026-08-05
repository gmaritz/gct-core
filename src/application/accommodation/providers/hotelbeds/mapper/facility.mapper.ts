import { AccommodationAmenity } from "@application/accommodation/models";

import { HotelbedsFacility } from "../models";

export function mapHotelbedsFacility(facility: HotelbedsFacility): AccommodationAmenity {
  return String(facility.facilityName ?? facility.facilityCode ?? "") as AccommodationAmenity;
}

export function mapHotelbedsFacilities(
  facilities: ReadonlyArray<HotelbedsFacility> = [],
): ReadonlyArray<AccommodationAmenity> {
  return facilities.map(mapHotelbedsFacility);
}
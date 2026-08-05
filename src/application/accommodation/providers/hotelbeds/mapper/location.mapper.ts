import { AccommodationLocation } from "../../../models";

import { HotelbedsLocation } from "../models";

function toNumber(value: string | number | undefined): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

export function mapHotelbedsLocation(location?: HotelbedsLocation): AccommodationLocation {
  return {
    country: location?.countryCode ?? "",
    region: location?.stateCode ?? "",
    city: location?.city ?? "",
    suburb: location?.zoneName ?? "",
    latitude: toNumber(location?.latitude),
    longitude: toNumber(location?.longitude),
  };
}
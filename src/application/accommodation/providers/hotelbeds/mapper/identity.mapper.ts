import { AccommodationIdentity } from "../../../models";

import { HotelbedsHotel } from "../models";

export function mapHotelbedsIdentity(hotel: HotelbedsHotel): AccommodationIdentity {
  const normalizedName =
    typeof hotel.name === "string"
      ? hotel.name
      : typeof hotel.name === "number"
        ? String(hotel.name)
        : "";

  return {
    id: String(hotel.code ?? ""),
    name: normalizedName,
  };
}
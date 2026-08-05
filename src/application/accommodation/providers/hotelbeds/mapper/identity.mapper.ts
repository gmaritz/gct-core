import { AccommodationIdentity } from "@application/accommodation/models";

import { HotelbedsHotel } from "../models";

export function mapHotelbedsIdentity(hotel: HotelbedsHotel): AccommodationIdentity {
  return {
    id: String(hotel.code ?? ""),
    name: hotel.name ?? "",
  };
}
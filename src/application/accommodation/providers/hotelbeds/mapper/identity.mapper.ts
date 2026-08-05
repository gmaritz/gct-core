import { AccommodationIdentity } from "../../../models";

import { HotelbedsHotel } from "../models";

export function mapHotelbedsIdentity(hotel: HotelbedsHotel): AccommodationIdentity {
  return {
    id: String(hotel.code ?? ""),
    name: hotel.name ?? "",
  };
}
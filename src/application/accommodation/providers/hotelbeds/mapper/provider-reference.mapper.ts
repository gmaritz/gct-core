import { AccommodationProviderReference } from "../../../models";

import { HotelbedsHotel } from "../models";

const HOTELBEDS_PROVIDER_ID = "hotelbeds";

export function mapHotelbedsProviderReference(hotel: HotelbedsHotel): AccommodationProviderReference {
  return {
    provider: HOTELBEDS_PROVIDER_ID,
    providerAccommodationId: String(hotel.code ?? ""),
  };
}
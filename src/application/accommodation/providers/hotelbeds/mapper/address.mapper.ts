import { AccommodationContact } from "@application/accommodation/models";

import { HotelbedsAddress } from "../models";

export function mapHotelbedsAddress(address?: HotelbedsAddress): AccommodationContact | undefined {
  if (!address) {
    return undefined;
  }

  return {
    email: address.email,
    telephone: address.phones?.[0],
  };
}
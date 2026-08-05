import { HotelbedsDestination } from "../models";

export function mapHotelbedsDestination(destination: HotelbedsDestination): HotelbedsDestination {
  return {
    ...destination,
    zones: destination.zones ? [...destination.zones] : undefined,
    groupZones: destination.groupZones ? [...destination.groupZones] : undefined,
  };
}
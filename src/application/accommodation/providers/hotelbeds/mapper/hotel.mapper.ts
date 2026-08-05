import { Accommodation, AccommodationCategory, AccommodationPolicy } from "../../../models";

import { HotelbedsHotel, HotelbedsLocation } from "../models";
import { mapHotelbedsAddress } from "./address.mapper";
import { mapHotelbedsFacilities } from "./facility.mapper";
import { mapHotelbedsIdentity } from "./identity.mapper";
import { mapHotelbedsImages } from "./image.mapper";
import { mapHotelbedsLocation } from "./location.mapper";
import { mapHotelbedsProviderReference } from "./provider-reference.mapper";
import { mapHotelbedsRating } from "./rating.mapper";

function mapHotelbedsCategory(hotel: HotelbedsHotel): AccommodationCategory {
  const categoryValue =
    hotel.accommodationTypeName ?? hotel.categoryName ?? hotel.accommodationTypeCode ?? hotel.categoryCode ?? "";

  return categoryValue as AccommodationCategory;
}

function buildLocationSource(hotel: HotelbedsHotel): HotelbedsLocation | undefined {
  if (hotel.location) {
    return hotel.location;
  }

  if (
    hotel.latitude === undefined &&
    hotel.longitude === undefined &&
    hotel.destinationCode === undefined &&
    hotel.destinationName === undefined &&
    hotel.zoneCode === undefined &&
    hotel.zoneName === undefined
  ) {
    return undefined;
  }

  return {
    latitude: hotel.latitude,
    longitude: hotel.longitude,
    destinationCode: hotel.destinationCode,
    destinationName: hotel.destinationName,
    zoneCode: hotel.zoneCode,
    zoneName: hotel.zoneName,
  };
}

function mapPolicies(): ReadonlyArray<AccommodationPolicy> {
  return [];
}

export class HotelMapper {
  mapHotel(hotel: HotelbedsHotel): Accommodation {
    const contact = mapHotelbedsAddress(hotel.address);

    return {
      identity: mapHotelbedsIdentity(hotel),
      category: mapHotelbedsCategory(hotel),
      location: mapHotelbedsLocation(buildLocationSource(hotel)),
      rating: mapHotelbedsRating(hotel),
      images: mapHotelbedsImages(hotel.images),
      amenities: mapHotelbedsFacilities(hotel.facilities),
      policies: mapPolicies(),
      contacts: contact ? [contact] : [],
      providerReference: mapHotelbedsProviderReference(hotel),
    };
  }
}
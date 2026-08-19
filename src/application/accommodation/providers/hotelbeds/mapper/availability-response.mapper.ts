import { Accommodation } from "../../../models";
import { AccommodationAvailabilityResult, AccommodationResultMetadata } from "../../../results";
import { HotelbedsAvailabilityRawResponse } from "../client";
import { HotelbedsHotel } from "../models";
import { HotelMapper } from "./hotel.mapper";

function createMetadata(): AccommodationResultMetadata {
  return {
    provider: "hotelbeds",
    generatedAt: new Date(),
    version: "1.0.0",
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getHotelPayloadEntries(value: unknown): ReadonlyArray<Record<string, unknown>> {
  if (Array.isArray(value)) {
    return value.filter(isObject);
  }

  if (!isObject(value)) {
    throw new Error("Malformed Hotelbeds availability response: body is not an object.");
  }

  const candidate = value as Record<string, unknown>;

  if (isObject(candidate.hotels) && Array.isArray(candidate.hotels.hotels)) {
    return candidate.hotels.hotels.filter(isObject);
  }

  if (Array.isArray(candidate.hotels)) {
    return candidate.hotels.filter(isObject);
  }

  const payload = candidate.payload;
  if (isObject(payload)) {
    if (Array.isArray(payload.hotels)) {
      return payload.hotels.filter(isObject);
    }

    if (Array.isArray(payload)) {
      return payload.filter(isObject);
    }
  }

  throw new Error("Malformed Hotelbeds availability response: hotels collection missing.");
}

function resolveAccommodation(hotel: Record<string, unknown>): Accommodation {
  const mappedHotel = {
    code:
      typeof hotel.code === "number" || typeof hotel.code === "string" ? hotel.code : undefined,
    name:
      typeof hotel.name === "string" || typeof hotel.name === "number" ? hotel.name : undefined,
    accommodationTypeCode:
      typeof hotel.accommodationTypeCode === "string" ? hotel.accommodationTypeCode : undefined,
    accommodationTypeName:
      typeof hotel.accommodationTypeName === "string" ? hotel.accommodationTypeName : undefined,
    categoryCode: typeof hotel.categoryCode === "string" ? hotel.categoryCode : undefined,
    categoryName: typeof hotel.categoryName === "string" ? hotel.categoryName : undefined,
    destinationCode:
      typeof hotel.destinationCode === "string" || typeof hotel.destinationCode === "number"
        ? hotel.destinationCode
        : undefined,
    destinationName:
      typeof hotel.destinationName === "string" ? hotel.destinationName : undefined,
    zoneCode: typeof hotel.zoneCode === "string" || typeof hotel.zoneCode === "number" ? hotel.zoneCode : undefined,
    zoneName: typeof hotel.zoneName === "string" ? hotel.zoneName : undefined,
    latitude: typeof hotel.latitude === "string" ? hotel.latitude : undefined,
    longitude: typeof hotel.longitude === "string" ? hotel.longitude : undefined,
    images: Array.isArray(hotel.images) ? (hotel.images as unknown[]) : [],
    facilities: Array.isArray(hotel.facilities) ? (hotel.facilities as unknown[]) : [],
    address: isObject(hotel.address) ? (hotel.address as Record<string, unknown>) : undefined,
    location: isObject(hotel.location) ? (hotel.location as Record<string, unknown>) : undefined,
  } as HotelbedsHotel;

  return new HotelMapper().mapHotel(mappedHotel);
}

function isQualifiedAvailabilityHotel(hotel: Record<string, unknown>): boolean {
  const rooms = Array.isArray(hotel.rooms) ? hotel.rooms : [];

  return rooms.some((room) => {
    if (!isObject(room)) {
      return false;
    }

    const roomRates = Array.isArray(room.rates) ? room.rates : [];

    return roomRates.some((rate) => {
      if (!isObject(rate)) {
        return false;
      }

      const allotment = rate.allotment;
      if (typeof allotment === "number") {
        return allotment > 0;
      }

      const rateType = rate.rateType;
      if (typeof rateType === "string") {
        return rateType === "BOOKABLE" || rateType === "RECHECK";
      }

      return Boolean(
        rate.sellingRate || rate.net || rate.rateKey || rate.boardCode || rate.boardName,
      );
    });
  });
}

function describeFailure(response: HotelbedsAvailabilityRawResponse): string {
  if (response.transportFailure) {
    return `Transport failure for request ${response.requestIndex}: ${response.transportFailure.message}`;
  }

  if (response.supplierError) {
    return `Supplier error for request ${response.requestIndex}: ${response.supplierError.message ?? response.supplierError.code ?? "Unknown supplier error"}`;
  }

  if (typeof response.httpStatus === "number") {
    return `HTTP failure for request ${response.requestIndex}: status ${response.httpStatus}`;
  }

  return `Execution failure for request ${response.requestIndex}`;
}

export class HotelbedsAvailabilityResponseMapper {
  public mapAvailabilityResponse(
    rawResponses: ReadonlyArray<HotelbedsAvailabilityRawResponse>,
  ): AccommodationAvailabilityResult {
    if (!rawResponses.length) {
      throw new Error("No Hotelbeds availability raw responses were supplied.");
    }

    const failure = rawResponses.find((response) => !response.success);
    if (failure) {
      throw new Error(`Hotelbeds availability mapping failed: ${describeFailure(failure)}`);
    }

    const successfulResponses = rawResponses.filter((response) => response.success);
    if (successfulResponses.length === 0) {
      throw new Error("No successful Hotelbeds availability responses were available for mapping.");
    }

    let firstAccommodation: Accommodation | undefined;
    let anyQualifiedAvailability = false;

    for (const response of successfulResponses) {
      const hotels = getHotelPayloadEntries(response.body);

      for (const hotel of hotels) {
        if (!firstAccommodation) {
          firstAccommodation = resolveAccommodation(hotel);
        }

        if (isQualifiedAvailabilityHotel(hotel)) {
          anyQualifiedAvailability = true;
        }
      }
    }

    if (!firstAccommodation) {
      throw new Error("Malformed Hotelbeds availability response: no supplier hotel entries were found.");
    }

    return {
      accommodation: firstAccommodation,
      available: anyQualifiedAvailability,
      metadata: createMetadata(),
    };
  }
}

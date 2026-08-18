"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelbedsAvailabilityResponseMapper = void 0;
const hotel_mapper_1 = require("./hotel.mapper");
function createMetadata() {
    return {
        provider: "hotelbeds",
        generatedAt: new Date(),
        version: "1.0.0",
    };
}
function isObject(value) {
    return typeof value === "object" && value !== null;
}
function getHotelPayloadEntries(value) {
    if (Array.isArray(value)) {
        return value.filter(isObject);
    }
    if (!isObject(value)) {
        throw new Error("Malformed Hotelbeds availability response: body is not an object.");
    }
    const candidate = value;
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
function resolveAccommodation(hotel) {
    const mappedHotel = {
        code: typeof hotel.code === "number" || typeof hotel.code === "string" ? hotel.code : undefined,
        name: typeof hotel.name === "string" || typeof hotel.name === "number" ? hotel.name : undefined,
        accommodationTypeCode: typeof hotel.accommodationTypeCode === "string" ? hotel.accommodationTypeCode : undefined,
        accommodationTypeName: typeof hotel.accommodationTypeName === "string" ? hotel.accommodationTypeName : undefined,
        categoryCode: typeof hotel.categoryCode === "string" ? hotel.categoryCode : undefined,
        categoryName: typeof hotel.categoryName === "string" ? hotel.categoryName : undefined,
        destinationCode: typeof hotel.destinationCode === "string" || typeof hotel.destinationCode === "number"
            ? hotel.destinationCode
            : undefined,
        destinationName: typeof hotel.destinationName === "string" ? hotel.destinationName : undefined,
        zoneCode: typeof hotel.zoneCode === "string" || typeof hotel.zoneCode === "number" ? hotel.zoneCode : undefined,
        zoneName: typeof hotel.zoneName === "string" ? hotel.zoneName : undefined,
        latitude: typeof hotel.latitude === "string" ? hotel.latitude : undefined,
        longitude: typeof hotel.longitude === "string" ? hotel.longitude : undefined,
        images: Array.isArray(hotel.images) ? hotel.images : [],
        facilities: Array.isArray(hotel.facilities) ? hotel.facilities : [],
        address: isObject(hotel.address) ? hotel.address : undefined,
        location: isObject(hotel.location) ? hotel.location : undefined,
    };
    return new hotel_mapper_1.HotelMapper().mapHotel(mappedHotel);
}
function isQualifiedAvailabilityHotel(hotel) {
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
            return Boolean(rate.sellingRate || rate.net || rate.rateKey || rate.boardCode || rate.boardName);
        });
    });
}
function describeFailure(response) {
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
class HotelbedsAvailabilityResponseMapper {
    mapAvailabilityResponse(rawResponses) {
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
        let firstAccommodation;
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
exports.HotelbedsAvailabilityResponseMapper = HotelbedsAvailabilityResponseMapper;
//# sourceMappingURL=availability-response.mapper.js.map
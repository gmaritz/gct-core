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
        currency: typeof hotel.currency === "string" ? hotel.currency : undefined,
        rooms: Array.isArray(hotel.rooms) ? hotel.rooms : [],
    };
    return new hotel_mapper_1.HotelMapper().mapHotel(mappedHotel);
}
function parseNumber(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }
    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number.parseFloat(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
}
function toReference(provider, opaqueReference) {
    return Object.freeze({ provider, opaqueReference });
}
function parseChildAges(value) {
    if (!value) {
        return Object.freeze([]);
    }
    return Object.freeze(value
        .split(/[,|~]/)
        .map((age) => Number.parseInt(age.trim(), 10))
        .filter((age) => Number.isInteger(age) && age >= 0));
}
function mapRequestedOccupancy(response) {
    const occupancies = response.request.body?.occupancies;
    if (!occupancies?.length) {
        return undefined;
    }
    return Object.freeze({
        rooms: Object.freeze(occupancies.map((occupancy) => Object.freeze({
            adults: occupancy.adults,
            children: occupancy.children,
            childAges: Object.freeze(occupancy.paxes
                .filter((pax) => pax.type === "CH" && typeof pax.age === "number")
                .map((pax) => pax.age)),
        }))),
    });
}
function mapOfferedOccupancy(rate) {
    const rooms = Math.max(1, rate.rooms ?? 1);
    const roomOccupancy = Object.freeze({
        adults: rate.adults ?? 0,
        children: rate.children ?? 0,
        childAges: parseChildAges(rate.childrenAges),
    });
    return Object.freeze({ rooms: Object.freeze(Array.from({ length: rooms }, () => roomOccupancy)) });
}
function mapStatus(rate) {
    if (rate.rateType === "RECHECK") {
        return "RECHECK_REQUIRED";
    }
    if (typeof rate.allotment === "number" && rate.allotment <= 0) {
        return "UNAVAILABLE";
    }
    if (rate.rateType === "BOOKABLE" || typeof rate.allotment === "number") {
        return "BOOKABLE";
    }
    return "UNKNOWN";
}
function mapCancellationPolicy(policy) {
    return Object.freeze({
        amount: parseNumber(policy.amount),
        from: policy.from,
        percent: parseNumber(policy.percent),
        numberOfNights: parseNumber(policy.numberOfNights),
    });
}
function mapTaxes(rate) {
    return Object.freeze((rate.taxes?.taxes ?? []).map((tax) => Object.freeze({
        type: tax.type,
        name: tax.subType,
        amount: parseNumber(tax.amount),
        currency: tax.currency,
        included: tax.included,
    })));
}
function mapRate(hotel, room, rate, index) {
    const hotelCode = String(hotel.code ?? "unknown");
    const roomCode = room.code ?? room.roomCode ?? room.PMSRoomCode ?? `room-${index}`;
    const opaqueReference = rate.rateKey ?? `${hotelCode}:${roomCode}:rate-${index}`;
    return Object.freeze({
        reference: toReference("hotelbeds", opaqueReference),
        status: mapStatus(rate),
        pricing: Object.freeze({
            amount: parseNumber(rate.sellingRate ?? rate.net) ?? 0,
            currency: hotel.currency ?? "UNKNOWN",
            basis: "TOTAL_STAY",
        }),
        occupancy: mapOfferedOccupancy(rate),
        board: rate.boardCode || rate.boardName
            ? Object.freeze({ code: rate.boardCode, name: rate.boardName })
            : undefined,
        allotment: rate.allotment,
        payment: rate.paymentType ? Object.freeze({ type: rate.paymentType }) : undefined,
        packaging: rate.packaging,
        cancellationPolicies: Object.freeze((rate.cancellationPolicies ?? []).map(mapCancellationPolicy)),
        taxes: mapTaxes(rate),
    });
}
function mapRoomOptions(hotel) {
    const roomOptions = [];
    (hotel.rooms ?? []).forEach((room, roomIndex) => {
        const roomCode = room.code ?? room.roomCode ?? room.PMSRoomCode ?? `room-${roomIndex}`;
        const rates = (room.rates ?? []).map((rate, rateIndex) => mapRate(hotel, room, rate, rateIndex));
        roomOptions.push(Object.freeze({
            reference: toReference("hotelbeds", room.supplierReference ?? roomCode),
            name: room.name ?? room.roomType ?? roomCode,
            rateOptions: Object.freeze(rates),
        }));
    });
    return Object.freeze({ roomOptions: Object.freeze(roomOptions) });
}
function mapHotelResult(hotel, response) {
    const accommodation = resolveAccommodation(hotel);
    const supplierHotel = accommodation.providerReference.providerAccommodationId;
    const typedHotel = {
        ...hotel,
        code: supplierHotel,
        currency: typeof hotel.currency === "string" ? hotel.currency : undefined,
        rooms: Array.isArray(hotel.rooms) ? hotel.rooms : [],
    };
    const availabilityOptions = mapRoomOptions(typedHotel);
    return Object.freeze({
        kind: "ACCOMMODATION",
        accommodation,
        available: availabilityOptions.roomOptions.some((room) => room.rateOptions.some((rate) => rate.status === "BOOKABLE" || rate.status === "RECHECK_REQUIRED")),
        requestedOccupancy: mapRequestedOccupancy(response),
        availabilityOptions,
        metadata: createMetadata(),
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
        const mappedResults = [];
        let noAvailabilityResponse = false;
        for (const response of successfulResponses) {
            if (isNoAvailabilityResponse(response.body)) {
                noAvailabilityResponse = true;
                continue;
            }
            const hotels = getHotelPayloadEntries(response.body);
            for (const hotel of hotels) {
                mappedResults.push(mapHotelResult(hotel, response));
            }
        }
        if (mappedResults.length === 0 && noAvailabilityResponse) {
            return { kind: "NO_AVAILABILITY" };
        }
        if (mappedResults.length === 0) {
            throw new Error("Malformed Hotelbeds availability response: no supplier hotel entries were found.");
        }
        return {
            kind: "ACCOMMODATION",
            result: mappedResults.find((result) => result.available) ?? mappedResults[0],
            results: Object.freeze(mappedResults),
        };
    }
}
exports.HotelbedsAvailabilityResponseMapper = HotelbedsAvailabilityResponseMapper;
function isNoAvailabilityResponse(value) {
    if (!isObject(value) || !isObject(value.hotels)) {
        return false;
    }
    return value.hotels.total === 0;
}
//# sourceMappingURL=availability-response.mapper.js.map
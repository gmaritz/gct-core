"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelbedsAvailabilityRequestBuilder = void 0;
const discovery_1 = require("../../../discovery");
const MAX_HOTEL_CODES_PER_REQUEST = 2000;
function freezePaxes(paxes) {
    return Object.freeze(paxes.map((pax) => Object.freeze({ ...pax })));
}
function isValidDate(value) {
    return value instanceof Date && !Number.isNaN(value.getTime());
}
function formatDate(value, field) {
    if (!isValidDate(value)) {
        throw new Error(`Invalid ${field}.`);
    }
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, "0");
    const day = String(value.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
function assertPositiveInteger(value, field) {
    if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
        throw new Error(`Invalid ${field}.`);
    }
}
function assertNonNegativeInteger(value, field) {
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
        throw new Error(`Invalid ${field}.`);
    }
}
function createRoomFromOccupancyGroup(group, index) {
    if (group.rooms !== undefined && group.rooms !== 1) {
        throw new Error(`Invalid occupancies[${index}].rooms.`);
    }
    assertPositiveInteger(group.adults, `occupancies[${index}].adults`);
    assertNonNegativeInteger(group.children, `occupancies[${index}].children`);
    const childAges = [...group.childAges];
    if (childAges.length !== group.children) {
        throw new Error(`Invalid occupancies[${index}].childAges.`);
    }
    const childPaxes = childAges.map((age, ageIndex) => {
        assertNonNegativeInteger(age, `occupancies[${index}].childAges[${ageIndex}]`);
        return Object.freeze({
            type: "CH",
            age,
        });
    });
    const adultPaxes = Array.from({ length: group.adults }, () => Object.freeze({ type: "AD" }));
    return Object.freeze({
        rooms: 1,
        adults: group.adults,
        children: group.children,
        paxes: freezePaxes([...adultPaxes, ...childPaxes]),
    });
}
function createRoomsFromLegacyScalars(criteria) {
    assertPositiveInteger(criteria.adults, "adults");
    assertNonNegativeInteger(criteria.children, "children");
    assertPositiveInteger(criteria.rooms, "rooms");
    if (criteria.children > 0) {
        throw new Error("Legacy occupancy cannot represent child ages when children is greater than 0.");
    }
    return Object.freeze(Array.from({ length: criteria.rooms }, () => Object.freeze({
        rooms: 1,
        adults: criteria.adults,
        children: 0,
        paxes: freezePaxes(Array.from({ length: criteria.adults }, () => Object.freeze({ type: "AD" }))),
    })));
}
function resolveRooms(criteria) {
    const groups = criteria.occupancies;
    if (groups && groups.length > 0) {
        return Object.freeze(groups.map((group, index) => createRoomFromOccupancyGroup(group, index)));
    }
    return createRoomsFromLegacyScalars(criteria);
}
function resolveCandidateCodes(candidates) {
    const seen = new Set();
    const codes = [];
    candidates.forEach((candidate, index) => {
        const hotelCode = candidate?.hotelCode;
        if (!(0, discovery_1.isValidExplicitHotelCode)(hotelCode)) {
            throw new Error(`Invalid candidate hotel code at index ${index}.`);
        }
        const normalizedCode = hotelCode.trim();
        if (seen.has(normalizedCode)) {
            throw new Error(`Duplicate candidate hotel code detected: ${normalizedCode}.`);
        }
        seen.add(normalizedCode);
        codes.push(Number(normalizedCode));
    });
    return Object.freeze(codes);
}
function createBatches(codes) {
    const batches = [];
    for (let index = 0; index < codes.length; index += MAX_HOTEL_CODES_PER_REQUEST) {
        batches.push(codes.slice(index, index + MAX_HOTEL_CODES_PER_REQUEST));
    }
    return Object.freeze(batches.map((batch) => Object.freeze([...batch])));
}
class HotelbedsAvailabilityRequestBuilder {
    build(criteria, candidates) {
        if (!criteria) {
            throw new Error("Missing search criteria.");
        }
        const checkIn = formatDate(criteria.checkInDate, "checkInDate");
        const checkOut = formatDate(criteria.checkOutDate, "checkOutDate");
        if (criteria.checkOutDate.getTime() <= criteria.checkInDate.getTime()) {
            throw new Error("Invalid check-in/check-out range.");
        }
        const sourceMarket = criteria.sourceMarket?.trim();
        if (!sourceMarket) {
            throw new Error("Invalid source market.");
        }
        const rooms = resolveRooms(criteria);
        const codes = resolveCandidateCodes(candidates);
        if (codes.length === 0) {
            return Object.freeze([]);
        }
        const batches = createBatches(codes);
        return Object.freeze(batches.map((batch) => Object.freeze({
            operation: "availability",
            method: "POST",
            path: "/hotel-api/1.0/hotels",
            body: Object.freeze({
                stay: Object.freeze({ checkIn, checkOut }),
                sourceMarket,
                occupancies: Object.freeze(rooms.map((room) => Object.freeze({ ...room }))),
                hotels: Object.freeze({ codes: Object.freeze([...batch]) }),
            }),
        })));
    }
}
exports.HotelbedsAvailabilityRequestBuilder = HotelbedsAvailabilityRequestBuilder;
//# sourceMappingURL=hotelbeds-availability-request-builder.js.map
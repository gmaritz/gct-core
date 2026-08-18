"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelbedsContentMapper = void 0;
const client_1 = require("../client");
function parseCoordinate(value) {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : undefined;
    }
    if (typeof value === "string" && value.trim().length > 0) {
        const parsed = Number.parseFloat(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
}
function parseStarRating(hotel) {
    if (typeof hotel.S2C === "string" && hotel.S2C.trim().length > 0) {
        const parsed = Number.parseFloat(hotel.S2C);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }
    if (hotel.categoryCode) {
        const match = hotel.categoryCode.match(/(\d+(?:\.\d+)?)/);
        if (match) {
            const parsed = Number.parseFloat(match[1]);
            return Number.isFinite(parsed) ? parsed : undefined;
        }
    }
    return undefined;
}
function resolveLastUpdatedAt(hotel, fallback) {
    const rawLastUpdate = hotel.images?.find((image) => Boolean(image.lastUpdate))?.lastUpdate;
    if (!rawLastUpdate) {
        return { lastUpdatedAt: new Date(fallback.getTime()) };
    }
    const parsed = new Date(rawLastUpdate);
    if (Number.isNaN(parsed.getTime())) {
        return {
            lastUpdatedAt: new Date(fallback.getTime()),
            rawLastUpdate,
        };
    }
    return {
        lastUpdatedAt: parsed,
        rawLastUpdate,
    };
}
function normalizeString(value) {
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : undefined;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
    }
    return undefined;
}
function extractTextValue(value) {
    if (typeof value === "string" || typeof value === "number") {
        return normalizeString(value);
    }
    if (Array.isArray(value)) {
        for (const item of value) {
            const extracted = extractTextValue(item);
            if (extracted) {
                return extracted;
            }
        }
        return undefined;
    }
    if (value && typeof value === "object") {
        const candidate = value;
        return normalizeString(candidate.content);
    }
    return undefined;
}
class HotelbedsContentMapper {
    mapHotel(hotel, fallbackUpdatedAt) {
        if (typeof hotel.code !== "number" && typeof hotel.code !== "string") {
            throw (0, client_1.createHotelbedsIntegrationError)({
                code: client_1.HotelbedsIntegrationErrorCode.VALIDATION_ERROR,
                message: "Hotelbeds content hotel code is required.",
                retryable: false,
            });
        }
        const hotelCode = String(hotel.code).trim();
        if (hotelCode.length === 0) {
            throw (0, client_1.createHotelbedsIntegrationError)({
                code: client_1.HotelbedsIntegrationErrorCode.VALIDATION_ERROR,
                message: "Hotelbeds content hotel code is required.",
                retryable: false,
            });
        }
        const hotelName = extractTextValue(hotel.name);
        if (!hotelName) {
            throw (0, client_1.createHotelbedsIntegrationError)({
                code: client_1.HotelbedsIntegrationErrorCode.VALIDATION_ERROR,
                message: `Hotelbeds hotel ${hotelCode} does not include a name.`,
                retryable: false,
            });
        }
        const description = extractTextValue(hotel.description);
        const update = resolveLastUpdatedAt(hotel, fallbackUpdatedAt);
        return {
            provider: "hotelbeds",
            providerHotelCode: hotelCode,
            name: hotelName,
            description,
            categoryCode: hotel.categoryCode,
            categoryName: hotel.categoryName,
            starRating: parseStarRating(hotel),
            accommodationTypeCode: hotel.accommodationTypeCode,
            accommodationTypeName: hotel.accommodationTypeName,
            destinationCode: hotel.destinationCode ?? hotel.location?.destinationCode,
            destinationName: hotel.destinationName ?? hotel.location?.destinationName,
            coordinates: {
                latitude: parseCoordinate(hotel.latitude ?? hotel.location?.latitude),
                longitude: parseCoordinate(hotel.longitude ?? hotel.location?.longitude),
            },
            address: hotel.address
                ? {
                    line1: hotel.address.address1 ?? hotel.address.street ?? hotel.address.content,
                    line2: hotel.address.address2,
                    city: hotel.address.city ?? hotel.location?.city,
                    state: hotel.address.state,
                    postalCode: hotel.address.postalCode,
                    countryCode: hotel.address.countryCode ?? hotel.location?.countryCode,
                    countryName: hotel.address.countryName,
                }
                : undefined,
            contact: {
                email: hotel.address?.email,
                phones: Object.freeze([...(hotel.address?.phones ?? [])]),
            },
            facilities: Object.freeze((hotel.facilities ?? [])
                .filter((facility) => Boolean(facility.facilityCode || facility.facilityName))
                .map((facility) => ({
                code: String(facility.facilityCode ?? facility.facilityName ?? "unknown"),
                name: facility.facilityName ?? `Facility ${facility.facilityCode ?? "unknown"}`,
                groupCode: facility.facilityGroupCode !== undefined ? String(facility.facilityGroupCode) : undefined,
                groupName: facility.facilityGroupName,
            }))),
            images: Object.freeze((hotel.images ?? [])
                .filter((image) => typeof image.path === "string" && image.path.trim().length > 0)
                .map((image, index) => ({
                url: image.path.trim(),
                type: image.imageTypeCode ?? image.imageType,
                order: typeof image.order === "number" ? image.order : index + 1,
                description: image.description?.[0]?.content,
            }))),
            active: true,
            lastUpdatedAt: update.lastUpdatedAt,
            rawLastUpdate: update.rawLastUpdate,
        };
    }
}
exports.HotelbedsContentMapper = HotelbedsContentMapper;
//# sourceMappingURL=hotel-content.mapper.js.map
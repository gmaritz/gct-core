"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapHotelbedsLocation = mapHotelbedsLocation;
function toNumber(value) {
    if (typeof value === "number") {
        return value;
    }
    if (typeof value === "string") {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}
function mapHotelbedsLocation(location) {
    return {
        country: location?.countryCode ?? "",
        region: location?.stateCode ?? "",
        city: location?.city ?? "",
        suburb: location?.zoneName ?? "",
        latitude: toNumber(location?.latitude),
        longitude: toNumber(location?.longitude),
    };
}
//# sourceMappingURL=location.mapper.js.map
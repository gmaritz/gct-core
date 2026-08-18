"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapHotelbedsIdentity = mapHotelbedsIdentity;
function mapHotelbedsIdentity(hotel) {
    const normalizedName = typeof hotel.name === "string"
        ? hotel.name
        : typeof hotel.name === "number"
            ? String(hotel.name)
            : "";
    return {
        id: String(hotel.code ?? ""),
        name: normalizedName,
    };
}
//# sourceMappingURL=identity.mapper.js.map
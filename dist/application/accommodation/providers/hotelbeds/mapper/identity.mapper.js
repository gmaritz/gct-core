"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapHotelbedsIdentity = mapHotelbedsIdentity;
function mapHotelbedsIdentity(hotel) {
    return {
        id: String(hotel.code ?? ""),
        name: hotel.name ?? "",
    };
}
//# sourceMappingURL=identity.mapper.js.map
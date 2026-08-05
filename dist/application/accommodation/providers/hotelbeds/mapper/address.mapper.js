"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapHotelbedsAddress = mapHotelbedsAddress;
function mapHotelbedsAddress(address) {
    if (!address) {
        return undefined;
    }
    return {
        email: address.email,
        telephone: address.phones?.[0],
    };
}
//# sourceMappingURL=address.mapper.js.map
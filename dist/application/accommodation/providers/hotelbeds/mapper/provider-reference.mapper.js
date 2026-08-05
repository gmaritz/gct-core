"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapHotelbedsProviderReference = mapHotelbedsProviderReference;
const HOTELBEDS_PROVIDER_ID = "hotelbeds";
function mapHotelbedsProviderReference(hotel) {
    return {
        provider: HOTELBEDS_PROVIDER_ID,
        providerAccommodationId: String(hotel.code ?? ""),
    };
}
//# sourceMappingURL=provider-reference.mapper.js.map
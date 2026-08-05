"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapHotelbedsDestination = mapHotelbedsDestination;
function mapHotelbedsDestination(destination) {
    return {
        ...destination,
        zones: destination.zones ? [...destination.zones] : undefined,
        groupZones: destination.groupZones ? [...destination.groupZones] : undefined,
    };
}
//# sourceMappingURL=destination.mapper.js.map
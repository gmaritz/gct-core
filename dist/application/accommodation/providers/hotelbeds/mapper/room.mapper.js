"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapHotelbedsRoom = mapHotelbedsRoom;
exports.mapHotelbedsRooms = mapHotelbedsRooms;
function mapHotelbedsRoom(room) {
    return {
        ...room,
        paxes: room.paxes ? [...room.paxes] : undefined,
        facilities: room.facilities ? [...room.facilities] : undefined,
        roomFacilities: room.roomFacilities ? [...room.roomFacilities] : undefined,
        rates: room.rates ? [...room.rates] : undefined,
    };
}
function mapHotelbedsRooms(rooms = []) {
    return rooms.map(mapHotelbedsRoom);
}
//# sourceMappingURL=room.mapper.js.map
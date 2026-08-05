import { HotelbedsRoom } from "../models";

export function mapHotelbedsRoom(room: HotelbedsRoom): HotelbedsRoom {
  return {
    ...room,
    paxes: room.paxes ? [...room.paxes] : undefined,
    facilities: room.facilities ? [...room.facilities] : undefined,
    roomFacilities: room.roomFacilities ? [...room.roomFacilities] : undefined,
    rates: room.rates ? [...room.rates] : undefined,
  };
}

export function mapHotelbedsRooms(rooms: ReadonlyArray<HotelbedsRoom> = []): ReadonlyArray<HotelbedsRoom> {
  return rooms.map(mapHotelbedsRoom);
}
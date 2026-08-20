import { AccommodationBookingGuest, AccommodationBookingHolder } from "../../../booking";
import {
  AccommodationAvailabilityOccupancy,
  AccommodationRateOption,
  AccommodationRoomOption,
  AccommodationSupplierReference,
} from "../../../results";
import { HotelbedsHotel, HotelbedsRoom } from "../models";
import { HotelMapper } from "./hotel.mapper";
import { Accommodation } from "../../../models";

export interface HotelbedsBookingDetailsMapping {
  readonly status: "CONFIRMED" | "CANCELLED" | "MODIFIED" | "UNKNOWN";
  readonly accommodation?: Accommodation;
  readonly rooms: ReadonlyArray<AccommodationRoomOption>;
  readonly rate?: AccommodationRateOption;
  readonly stayPeriod?: { readonly checkIn: Date; readonly checkOut: Date };
  readonly occupancy?: AccommodationAvailabilityOccupancy;
  readonly guests?: ReadonlyArray<AccommodationBookingGuest>;
  readonly holder?: AccommodationBookingHolder;
  readonly supplierPrice?: { readonly amount: number; readonly currency: string };
  readonly cancellable?: boolean;
  readonly modifiable?: boolean;
}

function object(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : undefined;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function numberValue(value: unknown): number | undefined {
  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function dateValue(value: unknown): Date | undefined {
  if (typeof value !== "string") return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function statusValue(value: unknown): HotelbedsBookingDetailsMapping["status"] {
  const status = stringValue(value)?.toUpperCase() ?? "UNKNOWN";
  if (status.includes("CANCEL")) return "CANCELLED";
  if (status.includes("MODIF")) return "MODIFIED";
  if (status.includes("CONFIRM") || status === "BOOKED") return "CONFIRMED";
  return "UNKNOWN";
}

function mapRate(rate: Record<string, unknown>, hotelCurrency?: string): AccommodationRateOption {
  const reference: AccommodationSupplierReference = Object.freeze({
    provider: "hotelbeds",
    opaqueReference: stringValue(rate.rateKey) ?? stringValue(rate.reference) ?? "booking-rate",
  });
  const amount = numberValue(rate.sellingRate ?? rate.net ?? rate.amount) ?? 0;
  const currency = stringValue(rate.currency) ?? hotelCurrency ?? "UNKNOWN";
  return Object.freeze({
    reference,
    status: "BOOKABLE",
    pricing: Object.freeze({ amount, currency, basis: "TOTAL_STAY" }),
    occupancy: Object.freeze({ rooms: Object.freeze([{ adults: numberValue(rate.adults) ?? 0, children: numberValue(rate.children) ?? 0, childAges: Object.freeze([]) }]) }),
    board: rate.boardCode || rate.boardName ? Object.freeze({ code: stringValue(rate.boardCode), name: stringValue(rate.boardName) }) : undefined,
    allotment: numberValue(rate.allotment),
    payment: stringValue(rate.paymentType) ? Object.freeze({ type: stringValue(rate.paymentType)! }) : undefined,
    packaging: typeof rate.packaging === "boolean" ? rate.packaging : undefined,
    cancellationPolicies: Object.freeze([]),
    taxes: Object.freeze([]),
  });
}

function mapRooms(rooms: ReadonlyArray<HotelbedsRoom>, currency?: string): { rooms: ReadonlyArray<AccommodationRoomOption>; rate?: AccommodationRateOption } {
  let firstRate: AccommodationRateOption | undefined;
  const mapped = rooms.map((room, roomIndex) => {
    const roomCode = room.code ?? room.roomCode ?? room.PMSRoomCode ?? `room-${roomIndex}`;
    const rates = (room.rates ?? []).map((rate) => {
      const mappedRate = mapRate(rate as unknown as Record<string, unknown>, currency);
      firstRate ??= mappedRate;
      return mappedRate;
    });
    return Object.freeze({
      reference: Object.freeze({ provider: "hotelbeds", opaqueReference: room.supplierReference ?? roomCode }),
      name: room.name ?? room.roomType ?? roomCode,
      rateOptions: Object.freeze(rates),
    });
  });
  return { rooms: Object.freeze(mapped), rate: firstRate };
}

export function mapHotelbedsBookingDetails(payload: unknown): HotelbedsBookingDetailsMapping {
  const root = object(payload);
  const booking = object(root?.booking) ?? root;
  if (!booking) throw new Error("Hotelbeds booking details response is malformed.");
  const hotel = object(booking.hotel);
  const hotelModel = hotel ? { ...hotel, code: hotel.code, name: hotel.name } as HotelbedsHotel : undefined;
  const accommodation = hotelModel ? new HotelMapper().mapHotel(hotelModel) : undefined;
  const rooms = Array.isArray(booking.rooms) ? booking.rooms.filter(object) as unknown as HotelbedsRoom[] : hotelModel?.rooms ?? [];
  const mappedRooms = mapRooms(rooms, stringValue(booking.currency) ?? hotelModel?.currency);
  const stay = object(booking.stay) ?? booking;
  const checkIn = dateValue(stay.checkIn ?? booking.checkIn);
  const checkOut = dateValue(stay.checkOut ?? booking.checkOut);
  const holderObject = object(booking.holder);
  const holder = holderObject && stringValue(holderObject.name) && stringValue(holderObject.surname) && stringValue(holderObject.email)
    ? Object.freeze({ firstName: stringValue(holderObject.name)!, lastName: stringValue(holderObject.surname)!, email: stringValue(holderObject.email)!, phone: stringValue(holderObject.phone) })
    : undefined;
  const guests: AccommodationBookingGuest[] = [];
  rooms.forEach((room, roomIndex) => (room.paxes ?? []).forEach((pax) => {
    const firstName = pax.name ?? "";
    const lastName = pax.surname ?? "";
    guests.push(Object.freeze({ roomIndex, type: pax.type === "CH" ? "CHILD" : "ADULT", firstName, lastName, age: pax.age }));
  }));
  const occupancy = rooms.length ? Object.freeze({ rooms: Object.freeze(rooms.map((room) => Object.freeze({ adults: (room.paxes ?? []).filter((pax) => pax.type === "AD").length, children: (room.paxes ?? []).filter((pax) => pax.type === "CH").length, childAges: Object.freeze((room.paxes ?? []).filter((pax) => pax.type === "CH" && pax.age !== undefined).map((pax) => pax.age!)) }))) }) : undefined;
  const amount = numberValue(booking.totalSellingRate ?? booking.totalNet ?? booking.amount);
  const currency = stringValue(booking.currency) ?? hotelModel?.currency;
  return {
    status: statusValue(booking.status ?? booking.bookingStatus),
    accommodation,
    rooms: mappedRooms.rooms,
    rate: mappedRooms.rate,
    stayPeriod: checkIn && checkOut ? Object.freeze({ checkIn, checkOut }) : undefined,
    occupancy,
    guests: guests.length ? Object.freeze(guests) : undefined,
    holder,
    supplierPrice: amount !== undefined && currency ? Object.freeze({ amount, currency }) : undefined,
    cancellable: typeof booking.cancellable === "boolean" ? booking.cancellable : undefined,
    modifiable: typeof booking.modifiable === "boolean" ? booking.modifiable : undefined,
  };
}
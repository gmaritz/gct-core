import {
  AccommodationOccupancyGroup,
  AccommodationSearchCriteria,
  isValidExplicitHotelCode,
} from "../../../discovery";

import {
  HotelbedsAvailabilityOccupancy,
  HotelbedsAvailabilityPax,
  HotelbedsAvailabilityRequest,
  ResolvedHotelCandidate,
} from "./hotelbeds-availability-request";

const MAX_HOTEL_CODES_PER_REQUEST = 2000;

function freezePaxes(paxes: ReadonlyArray<HotelbedsAvailabilityPax>): ReadonlyArray<HotelbedsAvailabilityPax> {
  return Object.freeze(paxes.map((pax) => Object.freeze({ ...pax })));
}

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime());
}

function formatDate(value: Date, field: "checkInDate" | "checkOutDate"): string {
  if (!isValidDate(value)) {
    throw new Error(`Invalid ${field}.`);
  }

  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function assertPositiveInteger(value: unknown, field: string): asserts value is number {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new Error(`Invalid ${field}.`);
  }
}

function assertNonNegativeInteger(value: unknown, field: string): asserts value is number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error(`Invalid ${field}.`);
  }
}

function createRoomFromOccupancyGroup(
  group: AccommodationOccupancyGroup,
  index: number,
): HotelbedsAvailabilityOccupancy {
  if (group.rooms !== undefined && group.rooms !== 1) {
    throw new Error(`Invalid occupancies[${index}].rooms.`);
  }

  assertPositiveInteger(group.adults, `occupancies[${index}].adults`);
  assertNonNegativeInteger(group.children, `occupancies[${index}].children`);

  const childAges = [...group.childAges];
  if (childAges.length !== group.children) {
    throw new Error(`Invalid occupancies[${index}].childAges.`);
  }

  const childPaxes = childAges.map((age, ageIndex) => {
    assertNonNegativeInteger(age, `occupancies[${index}].childAges[${ageIndex}]`);
    return Object.freeze<HotelbedsAvailabilityPax>({
      type: "CH",
      age,
    });
  });

  const adultPaxes = Array.from({ length: group.adults }, () =>
    Object.freeze<HotelbedsAvailabilityPax>({ type: "AD" }),
  );

  return Object.freeze({
    rooms: 1,
    adults: group.adults,
    children: group.children,
    paxes: freezePaxes([...adultPaxes, ...childPaxes]),
  });
}

function createRoomsFromLegacyScalars(criteria: AccommodationSearchCriteria): ReadonlyArray<HotelbedsAvailabilityOccupancy> {
  assertPositiveInteger(criteria.adults, "adults");
  assertNonNegativeInteger(criteria.children, "children");
  assertPositiveInteger(criteria.rooms, "rooms");

  if (criteria.children > 0) {
    throw new Error("Legacy occupancy cannot represent child ages when children is greater than 0.");
  }

  return Object.freeze(
    Array.from({ length: criteria.rooms }, () =>
      Object.freeze({
        rooms: 1,
        adults: criteria.adults,
        children: 0,
        paxes: freezePaxes(
          Array.from({ length: criteria.adults }, () =>
            Object.freeze<HotelbedsAvailabilityPax>({ type: "AD" }),
          ),
        ),
      }),
    ),
  );
}

function resolveRooms(criteria: AccommodationSearchCriteria): ReadonlyArray<HotelbedsAvailabilityOccupancy> {
  const groups = criteria.occupancies;
  if (groups && groups.length > 0) {
    return Object.freeze(groups.map((group, index) => createRoomFromOccupancyGroup(group, index)));
  }

  return createRoomsFromLegacyScalars(criteria);
}

function resolveCandidateCodes(candidates: ReadonlyArray<ResolvedHotelCandidate>): ReadonlyArray<number> {
  const seen = new Set<string>();
  const codes: number[] = [];

  candidates.forEach((candidate, index) => {
    const hotelCode = candidate?.hotelCode;
    if (!isValidExplicitHotelCode(hotelCode)) {
      throw new Error(`Invalid candidate hotel code at index ${index}.`);
    }

    const normalizedCode = hotelCode.trim();
    if (seen.has(normalizedCode)) {
      throw new Error(`Duplicate candidate hotel code detected: ${normalizedCode}.`);
    }

    seen.add(normalizedCode);
    codes.push(Number(normalizedCode));
  });

  return Object.freeze(codes);
}

function createBatches(codes: ReadonlyArray<number>): ReadonlyArray<ReadonlyArray<number>> {
  const batches: number[][] = [];

  for (let index = 0; index < codes.length; index += MAX_HOTEL_CODES_PER_REQUEST) {
    batches.push(codes.slice(index, index + MAX_HOTEL_CODES_PER_REQUEST));
  }

  return Object.freeze(batches.map((batch) => Object.freeze([...batch])));
}

export class HotelbedsAvailabilityRequestBuilder {
  public build(
    criteria: AccommodationSearchCriteria,
    candidates: ReadonlyArray<ResolvedHotelCandidate>,
  ): ReadonlyArray<HotelbedsAvailabilityRequest> {
    if (!criteria) {
      throw new Error("Missing search criteria.");
    }

    const checkIn = formatDate(criteria.checkInDate, "checkInDate");
    const checkOut = formatDate(criteria.checkOutDate, "checkOutDate");
    if (criteria.checkOutDate.getTime() <= criteria.checkInDate.getTime()) {
      throw new Error("Invalid check-in/check-out range.");
    }

    const sourceMarket = criteria.sourceMarket?.trim();
    if (!sourceMarket) {
      throw new Error("Invalid source market.");
    }

    const rooms = resolveRooms(criteria);
    const codes = resolveCandidateCodes(candidates);

    if (codes.length === 0) {
      return Object.freeze([]);
    }

    const batches = createBatches(codes);
    return Object.freeze(
      batches.map((batch) =>
        Object.freeze({
          operation: "search",
          method: "POST",
          path: "/hotel-api/1.0/hotels",
          body: Object.freeze({
            stay: Object.freeze({ checkIn, checkOut }),
            sourceMarket,
            occupancies: Object.freeze(rooms.map((room) => Object.freeze({ ...room }))),
            hotels: Object.freeze({ codes: Object.freeze([...batch]) }),
          }),
        }),
      ),
    );
  }
}

import {
  AccommodationAvailabilityResult,
  AccommodationSearchQuery,
  HotelCatalogueService,
  InMemoryHotelCatalogueRepository,
  createHotelCatalogueEntry,
} from "../../../accommodation";
import { JourneyBookingContext, JourneySelectionStore } from "./journey-selection-store";
import {
  calculateCapeWinelandsStays,
  CapeWinelandsJourneyResolver,
  validateBookingContext,
} from "./cape-winelands-journey-resolver";
import {
  CAPE_WINELANDS_FRANSCHHOEK_PROPERTIES,
  CAPE_WINELANDS_HERMANUS_PROPERTIES,
  CAPE_WINELANDS_STELLENBOSCH_PROPERTIES,
  CapeWinelandsPropertyConfiguration,
} from "./cape-winelands-property-configuration";

const allProperties = [
  ...CAPE_WINELANDS_STELLENBOSCH_PROPERTIES,
  ...CAPE_WINELANDS_FRANSCHHOEK_PROPERTIES,
  ...CAPE_WINELANDS_HERMANUS_PROPERTIES,
];

function createAvailability(
  property: CapeWinelandsPropertyConfiguration,
  occupancies: NonNullable<AccommodationSearchQuery["criteria"]["occupancies"]>,
  propertyName = property.name,
): AccommodationAvailabilityResult {
  const requestedOccupancy = occupancies.map((room) => ({
    adults: room.adults,
    children: room.children,
    childAges: room.childAges,
  }));
  return {
    kind: "ACCOMMODATION",
    available: true,
    requestedOccupancy: { rooms: requestedOccupancy },
    accommodation: {
      identity: { id: property.hotelCode, name: propertyName },
      category: "Boutique Hotel",
      location: {
        country: "South Africa",
        region: "Western Cape",
        city: property.zoneName,
        suburb: "",
        latitude: 0,
        longitude: 0,
      },
      rating: { stars: property.starGrading, classification: "Premium" },
      images: [],
      amenities: [],
      policies: [],
      contacts: [],
      providerReference: { provider: "hotelbeds", providerAccommodationId: property.hotelCode },
    },
    metadata: { provider: "hotelbeds", generatedAt: new Date("2026-01-01T00:00:00.000Z"), version: "1.0.0" },
    availabilityOptions: {
      roomOptions: occupancies.map((occupancy, index) => ({
        reference: { provider: "hotelbeds", opaqueReference: `room-${property.hotelCode}-${index + 1}` },
        name: "Double Room",
        rateOptions: [{
          reference: { provider: "hotelbeds", opaqueReference: `rate-${property.hotelCode}-${index + 1}` },
          status: "BOOKABLE",
          pricing: { amount: 2500, currency: "ZAR", basis: "TOTAL_STAY" },
          occupancy: { rooms: [{ adults: occupancy.adults, children: occupancy.children, childAges: occupancy.childAges }] },
          cancellationPolicies: [],
          taxes: [],
        }],
      })),
    },
  };
}

async function createCatalogue(inactiveCodes: ReadonlyArray<string> = []): Promise<HotelCatalogueService> {
  const repository = new InMemoryHotelCatalogueRepository();
  for (const property of allProperties) {
    await repository.upsert(createHotelCatalogueEntry({
      hotelCode: property.hotelCode,
      starGrading: property.starGrading,
      destinationCode: "CPT",
      zoneCode: property.zoneCode,
      zoneName: property.zoneName,
      active: !inactiveCodes.includes(property.hotelCode),
    }));
  }
  return new HotelCatalogueService(repository);
}

function context(overrides: Partial<JourneyBookingContext> = {}): JourneyBookingContext {
  return {
    startDate: "2026-11-01",
    participants: 2,
    stopOccupancies: [
      { stopId: "cape-winelands-stellenbosch", rooms: [{ slotId: "cape-winelands-stellenbosch-room-1", adults: 2, children: 0, childAges: [] }] },
      { stopId: "cape-winelands-hermanus", rooms: [{ slotId: "cape-winelands-hermanus-room-1", adults: 2, children: 0, childAges: [] }] },
    ],
    ...overrides,
  };
}

function queryHotelCode(query: AccommodationSearchQuery): string {
  const code = query.criteria.hotelCodes?.[0];
  if (!code) throw new Error("Resolver query must contain a hotel code.");
  return code;
}

type OfferedRate = {
  readonly rateKey: string;
  readonly adults: number;
  readonly children?: number;
  readonly childAges?: ReadonlyArray<number>;
  readonly rooms?: number;
  readonly amount?: number;
  readonly currency?: string;
};

type OfferedRoom = { readonly code: string; readonly name: string; readonly rates: ReadonlyArray<OfferedRate> };

// Replaces the generated room options with explicit supplier-shaped offers keyed by rateKey.
function withOffers(
  availability: AccommodationAvailabilityResult,
  rooms: ReadonlyArray<OfferedRoom>,
): AccommodationAvailabilityResult {
  if (availability.kind !== "ACCOMMODATION") return availability;
  return {
    ...availability,
    availabilityOptions: {
      roomOptions: rooms.map((room) => ({
        reference: { provider: "hotelbeds", opaqueReference: room.code },
        name: room.name,
        rateOptions: room.rates.map((rate) => ({
          reference: { provider: "hotelbeds", opaqueReference: rate.rateKey },
          status: "BOOKABLE" as const,
          pricing: { amount: rate.amount ?? 500, currency: rate.currency ?? "EUR", basis: "TOTAL_STAY" },
          occupancy: {
            rooms: Array.from({ length: rate.rooms ?? 1 }, () => ({
              adults: rate.adults,
              children: rate.children ?? 0,
              childAges: rate.childAges ?? [],
            })),
          },
          cancellationPolicies: [],
          taxes: [],
        })),
      })),
    },
  };
}

function twoRoomBooking(
  firstStopRooms: JourneyBookingContext["stopOccupancies"][number]["rooms"],
): JourneyBookingContext {
  const adults = firstStopRooms.reduce((total, room) => total + room.adults, 0);
  const childAges = firstStopRooms.flatMap((room) => [...room.childAges]);
  return context({
    participants: adults,
    stopOccupancies: [
      { stopId: "cape-winelands-stellenbosch", rooms: firstStopRooms },
      {
        stopId: "cape-winelands-hermanus",
        rooms: [{ slotId: "cape-winelands-hermanus-room-1", adults, children: childAges.length, childAges }],
      },
    ],
  });
}

const adultRoom = (slot: number, adults = 2): JourneyBookingContext["stopOccupancies"][number]["rooms"][number] =>
  ({ slotId: `cape-winelands-stellenbosch-room-${slot}`, adults, children: 0, childAges: [] });

async function resolveStopOneOffers(
  firstStopRooms: JourneyBookingContext["stopOccupancies"][number]["rooms"],
  stopOneRooms: ReadonlyArray<OfferedRoom>,
  options: { readonly configureStore?: boolean } = {},
): Promise<Awaited<ReturnType<CapeWinelandsJourneyResolver["resolve"]>>> {
  const booking = twoRoomBooking(firstStopRooms);
  const availabilityService = {
    execute: async (query: AccommodationSearchQuery): Promise<AccommodationAvailabilityResult> => {
      const property = allProperties.find((candidate) => candidate.hotelCode === queryHotelCode(query))!;
      const generated = createAvailability(property, query.criteria.occupancies ?? []);
      const isStopOne = query.criteria.occupancies?.length === firstStopRooms.length
        && query.criteria.destination === "Stellenbosch";
      return isStopOne ? withOffers(generated, stopOneRooms) : generated;
    },
  };
  const store = new JourneySelectionStore();
  const resolver = new CapeWinelandsJourneyResolver(await createCatalogue(), availabilityService, undefined, store);
  if (options.configureStore) {
    store.configure("owner-a", "journey-homepage-journey-001", booking);
    return resolver.resolve("owner-a", "journey-homepage-journey-001");
  }
  return resolver.resolve("owner-a", "journey-homepage-journey-001", booking);
}

describe("CapeWinelandsJourneyResolver", () => {
  it("calculates the itinerary as deterministic UTC date-only stays", () => {
    const [stellenbosch, hermanus] = calculateCapeWinelandsStays("2026-11-01");

    expect(stellenbosch?.checkInDate.toISOString()).toBe("2026-11-01T00:00:00.000Z");
    expect(stellenbosch?.checkOutDate.toISOString()).toBe("2026-11-03T00:00:00.000Z");
    expect(hermanus?.checkInDate.toISOString()).toBe("2026-11-03T00:00:00.000Z");
    expect(hermanus?.checkOutDate.toISOString()).toBe("2026-11-04T00:00:00.000Z");
    expect(() => calculateCapeWinelandsStays("2026-02-30")).toThrow("valid journey start date");
  });

  it("validates participants and room allocations", () => {
    expect(validateBookingContext(context())).toBeUndefined();
    expect(validateBookingContext(context({ participants: 9 }))).toContain("2 to 8");
    expect(validateBookingContext(context({ participants: 3 }))).toContain("equal");
    expect(validateBookingContext(context({
      stopOccupancies: context().stopOccupancies.map((stop) => ({
        ...stop,
        rooms: [{ ...stop.rooms[0]!, children: 1, childAges: [8] }],
      })),
    }))).toContain("Children are not permitted");
    expect(validateBookingContext(context({
      stopOccupancies: context().stopOccupancies.map((stop) => ({
        ...stop,
        rooms: [{ ...stop.rooms[0]!, children: 1, childAges: [8] }],
      })),
    }), { childrenAllowed: true })).toBeUndefined();
  });

  it("enforces journey child policy, validates individual ages, and keeps stop allocations independent", () => {
    const booking = context({
      stopOccupancies: [
        {
          stopId: "cape-winelands-stellenbosch",
          rooms: [
            { slotId: "cape-winelands-stellenbosch-room-1", adults: 1, children: 1, childAges: [8] },
            { slotId: "cape-winelands-stellenbosch-room-2", adults: 1, children: 1, childAges: [11] },
          ],
        },
        {
          stopId: "cape-winelands-hermanus",
          rooms: [{ slotId: "cape-winelands-hermanus-room-1", adults: 2, children: 2, childAges: [8, 11] }],
        },
      ],
    });

    expect(validateBookingContext(booking)).toContain("Children are not permitted");
    expect(validateBookingContext(booking, { childrenAllowed: true })).toBeUndefined();
    expect(validateBookingContext(context({
      stopOccupancies: booking.stopOccupancies.map((stop) => ({
        ...stop,
        rooms: stop.rooms.map((room) => ({ ...room, childAges: [] })),
      })),
    }), { childrenAllowed: true })).toContain("one valid");
    expect(validateBookingContext(context({
      stopOccupancies: booking.stopOccupancies.map((stop) => ({
        ...stop,
        rooms: stop.rooms.map((room) => ({ ...room, childAges: [-1] })),
      })),
    }), { childrenAllowed: true })).toContain("one valid");
    expect(validateBookingContext(context({
      stopOccupancies: booking.stopOccupancies.map((stop) => ({
        ...stop,
        rooms: stop.rooms.map((room) => ({ ...room, childAges: [1.5] })),
      })),
    }), { childrenAllowed: true })).toContain("one valid");
  });

  it("uses Franschhoek only when no eligible Stellenbosch property is available", async () => {
    const calls: AccommodationSearchQuery[] = [];
    const availabilityService = {
      execute: async (query: AccommodationSearchQuery): Promise<AccommodationAvailabilityResult> => {
        calls.push(query);
        const code = queryHotelCode(query);
        const property = allProperties.find((candidate) => candidate.hotelCode === code)!;
        if (CAPE_WINELANDS_STELLENBOSCH_PROPERTIES.some((candidate) => candidate.hotelCode === code)) {
          return {
            kind: "NO_AVAILABILITY",
            available: false,
            metadata: { provider: "hotelbeds", generatedAt: new Date(), version: "1.0.0" },
          };
        }
        return createAvailability(property, query.criteria.occupancies ?? []);
      },
    };
    const resolver = new CapeWinelandsJourneyResolver(
      await createCatalogue(),
      availabilityService,
      undefined,
      new JourneySelectionStore(),
    );

    const result = await resolver.resolve("owner-a", "journey-homepage-journey-001", context());
    expect(result.status).toBe("RESOLVED");
    expect(result.journey?.accommodation.map((option) => option.packageStop?.destination)).toEqual(["Stellenbosch", "Hermanus"]);
    expect(result.journey?.accommodation[0]?.accommodationId).toBe(CAPE_WINELANDS_FRANSCHHOEK_PROPERTIES[0]?.hotelCode);
    expect(calls.map(queryHotelCode)).toEqual([
      CAPE_WINELANDS_STELLENBOSCH_PROPERTIES[0]?.hotelCode,
      CAPE_WINELANDS_FRANSCHHOEK_PROPERTIES[0]?.hotelCode,
      CAPE_WINELANDS_HERMANUS_PROPERTIES[0]?.hotelCode,
    ]);
    expect(calls[1]?.criteria.checkInDate.toISOString()).toBe("2026-11-01T00:00:00.000Z");
    expect(calls[1]?.criteria.checkOutDate.toISOString()).toBe("2026-11-03T00:00:00.000Z");
  });

  it("excludes inactive catalogue candidates and avoids unnecessary fallback searches", async () => {
    const calls: AccommodationSearchQuery[] = [];
    const inactiveCode = CAPE_WINELANDS_STELLENBOSCH_PROPERTIES[0]!.hotelCode;
    const availabilityService = {
      execute: async (query: AccommodationSearchQuery): Promise<AccommodationAvailabilityResult> => {
        calls.push(query);
        const property = allProperties.find((candidate) => candidate.hotelCode === queryHotelCode(query))!;
        return createAvailability(property, query.criteria.occupancies ?? []);
      },
    };
    const resolver = new CapeWinelandsJourneyResolver(
      await createCatalogue([inactiveCode]),
      availabilityService,
      undefined,
      new JourneySelectionStore(),
    );

    const result = await resolver.resolve("owner-a", "journey-homepage-journey-001", context());
    expect(result.status).toBe("RESOLVED");
    expect(result.journey?.accommodation[0]?.accommodationId).toBe(CAPE_WINELANDS_STELLENBOSCH_PROPERTIES[1]?.hotelCode);
    expect(calls).toHaveLength(2);
    expect(calls[0]?.criteria.hotelCodes ?? []).not.toContain(inactiveCode);
    expect(result.journey?.accommodation[0]?.packageStop?.approvedAccommodationIds).not.toContain(inactiveCode);
  });

  it("sends each stop's allocation together and offers a complete allocation with a distinct rateKey per room", async () => {
    const booking = context({
      stopOccupancies: [
        {
          stopId: "cape-winelands-stellenbosch",
          rooms: [
            { slotId: "cape-winelands-stellenbosch-room-1", adults: 1, children: 0, childAges: [] },
            { slotId: "cape-winelands-stellenbosch-room-2", adults: 1, children: 0, childAges: [] },
          ],
        },
        {
          stopId: "cape-winelands-hermanus",
          rooms: [{ slotId: "cape-winelands-hermanus-room-1", adults: 2, children: 0, childAges: [] }],
        },
      ],
    });
    const calls: AccommodationSearchQuery[] = [];
    const availabilityService = {
      execute: async (query: AccommodationSearchQuery): Promise<AccommodationAvailabilityResult> => {
        calls.push(query);
        const property = allProperties.find((candidate) => candidate.hotelCode === queryHotelCode(query))!;
        return createAvailability(property, query.criteria.occupancies ?? []);
      },
    };
    const resolver = new CapeWinelandsJourneyResolver(
      await createCatalogue(),
      availabilityService,
      undefined,
      new JourneySelectionStore(),
    );

    const result = await resolver.resolve("owner-a", "journey-homepage-journey-001", booking);

    expect(result.status).toBe("RESOLVED");
    expect(calls).toHaveLength(2);
    expect(calls.map((query) => query.criteria.occupancies?.map((room) => room.adults))).toEqual([[1, 1], [2]]);
    expect(calls.flatMap((query) => query.criteria.occupancies ?? []).every((room) => room.rooms === 1)).toBe(true);
    const [stopOne, stopTwo] = result.journey!.accommodation;
    expect(stopOne?.requestedOccupancy?.rooms.map((room) => room.slotId))
      .toEqual(["cape-winelands-stellenbosch-room-1", "cape-winelands-stellenbosch-room-2"]);
    expect(stopTwo?.requestedOccupancy?.rooms.map((room) => room.slotId)).toEqual(["cape-winelands-hermanus-room-1"]);
    const rateKeys = stopOne!.roomOptions!.flatMap((room) => room.rateOptions.map((rate) => rate.reference.opaqueReference));
    expect(new Set(rateKeys).size).toBe(2);
  });

  describe("multi-room rateKey allocation", () => {
    // Modelled on the Hotelbeds Postman reference transaction (booking 241-749700): two different room
    // types selected from one Availability response. The rateKeys here are synthetic test values.
    const apartmentB2: OfferedRoom = {
      code: "APT.B2",
      name: "Apartment B2",
      rates: [{ rateKey: "synthetic-rate-apt-b2", adults: 2, amount: 266.91 }],
    };
    const apartmentB3: OfferedRoom = {
      code: "APT.B3-C6",
      name: "Apartment B3-C6",
      rates: [{ rateKey: "synthetic-rate-apt-b3-c6", adults: 2, amount: 275.83 }],
    };

    it("offers two rooms of different room types with different rateKeys, preserving each rateKey and slot", async () => {
      const result = await resolveStopOneOffers([adultRoom(1), adultRoom(2)], [apartmentB2, apartmentB3]);

      expect(result.status).toBe("RESOLVED");
      const stopOne = result.journey!.accommodation[0]!;
      expect(stopOne.roomOptions?.map((room) => room.reference.opaqueReference)).toEqual(["APT.B2", "APT.B3-C6"]);
      expect(stopOne.roomOptions?.flatMap((room) => room.rateOptions.map((rate) => rate.reference.opaqueReference)))
        .toEqual(["synthetic-rate-apt-b2", "synthetic-rate-apt-b3-c6"]);
      expect(stopOne.roomOptions?.flatMap((room) => room.rateOptions.map((rate) => rate.pricing)))
        .toEqual([
          { amount: 266.91, currency: "EUR", basis: "TOTAL_STAY" },
          { amount: 275.83, currency: "EUR", basis: "TOTAL_STAY" },
        ]);
      expect(stopOne.requestedOccupancy?.rooms.map((room) => room.slotId))
        .toEqual(["cape-winelands-stellenbosch-room-1", "cape-winelands-stellenbosch-room-2"]);
    });

    it("offers two rooms of the same room type and occupancy when their rateKeys are different", async () => {
      const result = await resolveStopOneOffers([adultRoom(1), adultRoom(2)], [{
        code: "APT.B2",
        name: "Apartment B2",
        rates: [
          { rateKey: "synthetic-rate-1", adults: 2 },
          { rateKey: "synthetic-rate-2", adults: 2 },
        ],
      }]);

      expect(result.status).toBe("RESOLVED");
      expect(result.journey!.accommodation[0]!.roomOptions?.[0]?.rateOptions.map((rate) => rate.reference.opaqueReference))
        .toEqual(["synthetic-rate-1", "synthetic-rate-2"]);
    });

    it("matches different occupancies, including a child and the child's age, to their own rooms", async () => {
      const rooms = [
        adultRoom(1),
        { slotId: "cape-winelands-stellenbosch-room-2", adults: 2, children: 1, childAges: [7] },
      ];
      const complete = await resolveStopOneOffers(rooms, [{
        code: "APT.B2",
        name: "Apartment B2",
        rates: [
          { rateKey: "synthetic-adults", adults: 2 },
          { rateKey: "synthetic-child-7", adults: 2, children: 1, childAges: [7] },
        ],
      }], { configureStore: true });

      expect(complete.status).toBe("RESOLVED");
      expect(complete.journey!.accommodation[0]!.roomOptions?.[0]?.rateOptions
        .map((rate) => [rate.reference.opaqueReference, rate.occupancy.rooms[0]]))
        .toEqual([
          ["synthetic-adults", { adults: 2, children: 0, childAges: [] }],
          ["synthetic-child-7", { adults: 2, children: 1, childAges: [7] }],
        ]);
      expect(complete.journey!.accommodation[0]!.requestedOccupancy?.rooms[1])
        .toEqual({ slotId: "cape-winelands-stellenbosch-room-2", adults: 2, children: 1, childAges: [7] });

      const wrongAge = await resolveStopOneOffers(rooms, [{
        code: "APT.B2",
        name: "Apartment B2",
        rates: [
          { rateKey: "synthetic-adults", adults: 2 },
          { rateKey: "synthetic-child-8", adults: 2, children: 1, childAges: [8] },
        ],
      }], { configureStore: true });
      expect(wrongAge.status).toBe("UNAVAILABLE");
    });

    it("does not let one rateKey, repeated in the response, satisfy two room slots", async () => {
      const repeated = { rateKey: "synthetic-rate-1", adults: 2 };
      const result = await resolveStopOneOffers([adultRoom(1), adultRoom(2)], [
        { code: "APT.B2", name: "Apartment B2", rates: [repeated, repeated] },
        { code: "APT.B2", name: "Apartment B2", rates: [repeated] },
      ]);

      expect(result.status).toBe("UNAVAILABLE");
    });

    it("treats identical repeated response entries as one offer without creating inventory", async () => {
      const result = await resolveStopOneOffers([adultRoom(1), adultRoom(2)], [
        { code: "APT.B2", name: "Apartment B2", rates: [apartmentB2.rates[0]!, apartmentB2.rates[0]!] },
        { code: "APT.B3-C6", name: "Apartment B3-C6", rates: [apartmentB3.rates[0]!] },
        { code: "APT.B2", name: "Apartment B2", rates: [apartmentB2.rates[0]!] },
      ]);

      expect(result.status).toBe("RESOLVED");
      const rateKeys = result.journey!.accommodation[0]!.roomOptions!
        .flatMap((room) => room.rateOptions.map((rate) => rate.reference.opaqueReference));
      expect(rateKeys).toEqual(["synthetic-rate-apt-b2", "synthetic-rate-apt-b3-c6"]);
    });

    it("rejects a property whose rateKey is described inconsistently", async () => {
      const result = await resolveStopOneOffers([adultRoom(1), adultRoom(2)], [
        { code: "APT.B2", name: "Apartment B2", rates: [{ rateKey: "synthetic-rate-1", adults: 2, amount: 100 }] },
        { code: "APT.B3-C6", name: "Apartment B3-C6", rates: [{ rateKey: "synthetic-rate-1", adults: 2, amount: 200 }, { rateKey: "synthetic-rate-2", adults: 2 }] },
      ]);

      expect(result.status).toBe("UNAVAILABLE");
    });

    it("rejects an allocation with a missing room offer", async () => {
      const result = await resolveStopOneOffers([adultRoom(1), adultRoom(2)], [apartmentB2]);

      expect(result.status).toBe("UNAVAILABLE");
    });

    it("rejects an allocation whose offers have a different occupancy", async () => {
      const result = await resolveStopOneOffers([adultRoom(1), adultRoom(2)], [
        apartmentB2,
        { code: "APT.B3-C6", name: "Apartment B3-C6", rates: [{ rateKey: "synthetic-rate-single", adults: 1 }] },
      ]);

      expect(result.status).toBe("UNAVAILABLE");
    });

    it("rejects a rate that describes more than one room, because rate.rooms > 1 semantics are unresolved", async () => {
      const result = await resolveStopOneOffers([adultRoom(1), adultRoom(2)], [apartmentB2, {
        code: "APT.B3-C6",
        name: "Apartment B3-C6",
        rates: [{ rateKey: "synthetic-rate-two-rooms", adults: 2, rooms: 2 }],
      }]);

      expect(result.status).toBe("UNAVAILABLE");
    });

    it("keeps single-room availability unchanged", async () => {
      const result = await resolveStopOneOffers([adultRoom(1)], [apartmentB2]);

      expect(result.status).toBe("RESOLVED");
      expect(result.journey!.accommodation[0]!.requestedOccupancy?.rooms).toHaveLength(1);
      expect(result.journey!.accommodation[0]!.roomOptions?.[0]?.rateOptions[0]?.reference.opaqueReference)
        .toBe("synthetic-rate-apt-b2");
    });
  });

  it("rejects a property whose response supplies only a subset of the requested room slots", async () => {
    const booking = context({
      stopOccupancies: [
        {
          stopId: "cape-winelands-stellenbosch",
          rooms: [
            { slotId: "cape-winelands-stellenbosch-room-1", adults: 1, children: 0, childAges: [] },
            { slotId: "cape-winelands-stellenbosch-room-2", adults: 1, children: 0, childAges: [] },
          ],
        },
        {
          stopId: "cape-winelands-hermanus",
          rooms: [{ slotId: "cape-winelands-hermanus-room-1", adults: 2, children: 0, childAges: [] }],
        },
      ],
    });
    const availabilityService = {
      execute: async (query: AccommodationSearchQuery): Promise<AccommodationAvailabilityResult> => {
        const property = allProperties.find((candidate) => candidate.hotelCode === queryHotelCode(query))!;
        const complete = createAvailability(property, query.criteria.occupancies ?? []);
        if (query.criteria.occupancies?.length !== 2 || complete.kind !== "ACCOMMODATION") return complete;
        return {
          ...complete,
          availabilityOptions: {
            roomOptions: complete.availabilityOptions?.roomOptions.slice(0, 1) ?? [],
          },
        };
      },
    };
    const resolver = new CapeWinelandsJourneyResolver(
      await createCatalogue(),
      availabilityService,
      undefined,
      new JourneySelectionStore(),
    );

    await expect(resolver.resolve("owner-a", "journey-homepage-journey-001", booking))
      .resolves.toEqual({ status: "UNAVAILABLE" });
  });

  it("does not treat request-derived occupancy as supplier evidence when the returned rate differs", async () => {
    const availabilityService = {
      execute: async (query: AccommodationSearchQuery): Promise<AccommodationAvailabilityResult> => {
        const property = allProperties.find((candidate) => candidate.hotelCode === queryHotelCode(query))!;
        const result = createAvailability(property, query.criteria.occupancies ?? []);
        if (result.kind !== "ACCOMMODATION") return result;
        return {
          ...result,
          availabilityOptions: {
            roomOptions: result.availabilityOptions?.roomOptions.map((room) => ({
              ...room,
              rateOptions: room.rateOptions.map((rate) => ({
                ...rate,
                occupancy: { rooms: [{ adults: 1, children: 0, childAges: [] }] },
              })),
            })) ?? [],
          },
        };
      },
    };
    const resolver = new CapeWinelandsJourneyResolver(
      await createCatalogue(),
      availabilityService,
      undefined,
      new JourneySelectionStore(),
    );

    await expect(resolver.resolve("owner-a", "journey-homepage-journey-001", context()))
      .resolves.toEqual({ status: "UNAVAILABLE" });
  });

  it("rejects supplier results whose name does not match the configured property", async () => {
    const availabilityService = {
      execute: async (query: AccommodationSearchQuery): Promise<AccommodationAvailabilityResult> => {
        const property = allProperties.find((candidate) => candidate.hotelCode === queryHotelCode(query))!;
        return createAvailability(property, query.criteria.occupancies ?? [], "Different Hotel");
      },
    };
    const resolver = new CapeWinelandsJourneyResolver(
      await createCatalogue(),
      availabilityService,
      undefined,
      new JourneySelectionStore(),
    );

    await expect(resolver.resolve("owner-a", "journey-homepage-journey-001", context())).resolves.toEqual({ status: "UNAVAILABLE" });
  });
});

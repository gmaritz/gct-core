import { AccommodationAvailabilityResult, AccommodationSearchContext, AccommodationSearchCriteria, AccommodationSearchQuery, AccommodationSearchSource, InMemoryProviderRegistry, ProviderRegistry } from "@application/accommodation";

import { DefaultAccommodationAvailabilityService } from "./service/accommodation-availability-service";

function createCriteria(overrides: Partial<AccommodationSearchCriteria> = {}): AccommodationSearchCriteria {
  return {
    destination: "Cape Town",
    checkInDate: new Date("2026-09-10T00:00:00.000Z"),
    checkOutDate: new Date("2026-09-14T00:00:00.000Z"),
    adults: 2,
    children: 0,
    rooms: 1,
    sourceMarket: "ZA",
    hotelCodes: ["101", "102"],
    ...overrides,
  };
}

function createContext(): AccommodationSearchContext {
  return {
    requestId: "req-availability-001",
    source: AccommodationSearchSource.API,
    channel: "web",
    locale: "en-ZA",
    currency: "ZAR",
    timestamp: new Date("2026-08-05T00:00:00.000Z"),
  };
}

function createQuery(overrides: Partial<AccommodationSearchCriteria> = {}): AccommodationSearchQuery {
  return {
    criteria: createCriteria(overrides),
    context: createContext(),
  };
}

function createAvailabilityResult(provider: string): AccommodationAvailabilityResult {
  return {
    accommodation: {
      identity: {
        id: "101",
        name: "Available Hotel",
      },
      category: "Guest House",
      location: {
        country: "ZA",
        region: "WC",
        city: "Cape Town",
        suburb: "City Bowl",
        latitude: -33.92,
        longitude: 18.42,
      },
      rating: {
        stars: 4,
        classification: "Premium",
      },
      images: [],
      amenities: [],
      policies: [],
      contacts: [],
      providerReference: {
        provider,
        providerAccommodationId: "101",
      },
    },
    available: true,
    metadata: {
      provider,
      generatedAt: new Date("2026-08-05T00:00:00.000Z"),
      version: "1.0.0",
    },
  };
}

describe("Accommodation availability orchestration service", () => {
  it("runs the accepted R2-R5 flow and returns the canonical result", async () => {
    const catalogueService = {
      select: jest.fn().mockResolvedValue({
        hotelCodes: ["101", "102"],
        selectionMode: "EXPLICIT",
      }),
    };

    const requestBuilder = {
      build: jest.fn().mockReturnValue([
        {
          operation: "availability",
          method: "POST",
          path: "/hotel-api/1.0/hotels",
          body: {
            stay: { checkIn: "2026-09-10", checkOut: "2026-09-14" },
            sourceMarket: "ZA",
            occupancies: [
              {
                rooms: 1,
                adults: 2,
                children: 0,
                paxes: [{ type: "AD" }, { type: "AD" }],
              },
            ],
            hotels: { codes: [101, 102] },
          },
        },
      ]),
    };

    const rawResponses = [{
      requestIndex: 0,
      request: requestBuilder.build()[0],
      success: true,
      retryable: false,
      attempts: 1,
      errors: [],
      body: {
        hotels: [{
          code: 101,
          name: "Available Hotel",
          rooms: [{
            code: "DBL.ST",
            rates: [{ rateType: "BOOKABLE", allotment: 4, sellingRate: "300.00" }],
          }],
        }],
      },
    }];

    const provider = {
      providerId: "hotelbeds",
      capabilities: { capabilities: [] },
      async search() {
        return { accommodations: [], metadata: { generatedAt: new Date(), version: "1.0.0" } };
      },
      async executeAvailabilityRequests(requests: unknown[]) {
        expect(requests).toHaveLength(1);
        return {
          provider: "hotelbeds",
          operation: "availability",
          completedAt: new Date("2026-08-05T00:00:00.000Z"),
          responses: rawResponses,
        };
      },
      mapAvailabilityResponse(responses: unknown[]) {
        expect(responses).toEqual(rawResponses);
        return createAvailabilityResult("hotelbeds");
      },
    };

    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    registry.register(provider as never);

    const service = new DefaultAccommodationAvailabilityService(
      registry,
      catalogueService as never,
      requestBuilder as never,
    );

    const result = await service.execute(createQuery());

    expect(catalogueService.select).toHaveBeenCalledWith({
      hotelCodes: ["101", "102"],
      destinationCode: undefined,
      zoneCode: undefined,
      starGrading: undefined,
    });
    expect(requestBuilder.build).toHaveBeenCalledWith(createCriteria(), [{ hotelCode: "101" }, { hotelCode: "102" }]);
    expect(result.available).toBe(true);
    expect(result.metadata.provider).toBe("hotelbeds");
  });

  it("returns the canonical unavailable result when candidate resolution yields no hotels", async () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    const service = new DefaultAccommodationAvailabilityService(
      registry,
      { select: jest.fn().mockResolvedValue({ hotelCodes: [], selectionMode: "EXPLICIT" }) } as never,
    );

    const result = await service.execute(createQuery());

    expect(result.available).toBe(false);
    expect(result.accommodation.identity.id).toBe("unavailable");
  });

  it("returns the canonical unavailable result when no supplier requests are built", async () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    registry.register({
      providerId: "hotelbeds",
      capabilities: { capabilities: [] },
      async search() {
        return { accommodations: [], metadata: { generatedAt: new Date(), version: "1.0.0" } };
      },
      async executeAvailabilityRequests() {
        throw new Error("should not call provider");
      },
      mapAvailabilityResponse() {
        throw new Error("should not map");
      },
    } as never);

    const service = new DefaultAccommodationAvailabilityService(
      registry,
      { select: jest.fn().mockResolvedValue({ hotelCodes: ["101"], selectionMode: "EXPLICIT" }) } as never,
      { build: jest.fn().mockReturnValue([]) } as never,
    );

    const result = await service.execute(createQuery());

    expect(result.available).toBe(false);
    expect(result.accommodation.identity.id).toBe("unavailable");
  });

  it("propagates candidate resolution failures without invoking supplier execution", async () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    const execution = jest.fn();
    registry.register({
      providerId: "hotelbeds",
      capabilities: { capabilities: [] },
      async search() { return { accommodations: [], metadata: { generatedAt: new Date(), version: "1.0.0" } }; },
      async executeAvailabilityRequests() { execution(); return { provider: "hotelbeds", operation: "availability", completedAt: new Date(), responses: [] }; },
      mapAvailabilityResponse() { return createAvailabilityResult("hotelbeds"); },
    } as never);

    const service = new DefaultAccommodationAvailabilityService(
      registry,
      { select: jest.fn().mockRejectedValue(new Error("candidate failure")) } as never,
    );

    await expect(service.execute(createQuery())).rejects.toThrow("candidate failure");
    expect(execution).not.toHaveBeenCalled();
  });

  it("propagates request construction failures without invoking supplier execution", async () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    const execution = jest.fn();
    registry.register({
      providerId: "hotelbeds",
      capabilities: { capabilities: [] },
      async search() { return { accommodations: [], metadata: { generatedAt: new Date(), version: "1.0.0" } }; },
      async executeAvailabilityRequests() { execution(); return { provider: "hotelbeds", operation: "availability", completedAt: new Date(), responses: [] }; },
      mapAvailabilityResponse() { return createAvailabilityResult("hotelbeds"); },
    } as never);

    const service = new DefaultAccommodationAvailabilityService(
      registry,
      { select: jest.fn().mockResolvedValue({ hotelCodes: ["101"], selectionMode: "EXPLICIT" }) } as never,
      { build: jest.fn().mockImplementation(() => { throw new Error("request construction failure"); }) } as never,
    );

    await expect(service.execute(createQuery())).rejects.toThrow("request construction failure");
    expect(execution).not.toHaveBeenCalled();
  });

  it("propagates supplier execution failures without converting them to unavailable", async () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    registry.register({
      providerId: "hotelbeds",
      capabilities: { capabilities: [] },
      async search() { return { accommodations: [], metadata: { generatedAt: new Date(), version: "1.0.0" } }; },
      async executeAvailabilityRequests() { throw new Error("supplier transport failure"); },
      mapAvailabilityResponse() { return createAvailabilityResult("hotelbeds"); },
    } as never);

    const service = new DefaultAccommodationAvailabilityService(
      registry,
      { select: jest.fn().mockResolvedValue({ hotelCodes: ["101"], selectionMode: "EXPLICIT" }) } as never,
      { build: jest.fn().mockReturnValue([{ operation: "availability", method: "POST", path: "/hotel-api/1.0/hotels", body: { stay: { checkIn: "2026-09-10", checkOut: "2026-09-14" }, sourceMarket: "ZA", occupancies: [{ rooms: 1, adults: 2, children: 0, paxes: [{ type: "AD" }, { type: "AD" }] }], hotels: { codes: [101] } } }]) } as never,
    );

    await expect(service.execute(createQuery())).rejects.toThrow("supplier transport failure");
  });

  it("propagates mapping failures without inventing canonical success semantics", async () => {
    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    registry.register({
      providerId: "hotelbeds",
      capabilities: { capabilities: [] },
      async search() { return { accommodations: [], metadata: { generatedAt: new Date(), version: "1.0.0" } }; },
      async executeAvailabilityRequests() {
        return { provider: "hotelbeds", operation: "availability", completedAt: new Date(), responses: [] };
      },
      mapAvailabilityResponse() { throw new Error("mapping failure"); },
    } as never);

    const service = new DefaultAccommodationAvailabilityService(
      registry,
      { select: jest.fn().mockResolvedValue({ hotelCodes: ["101"], selectionMode: "EXPLICIT" }) } as never,
      { build: jest.fn().mockReturnValue([{ operation: "availability", method: "POST", path: "/hotel-api/1.0/hotels", body: { stay: { checkIn: "2026-09-10", checkOut: "2026-09-14" }, sourceMarket: "ZA", occupancies: [{ rooms: 1, adults: 2, children: 0, paxes: [{ type: "AD" }, { type: "AD" }] }], hotels: { codes: [101] } } }]) } as never,
    );

    await expect(service.execute(createQuery())).rejects.toThrow("mapping failure");
  });

  it("preserves the search context while orchestrating the accepted capability chain", async () => {
    const criteria = createCriteria();
    const context = createContext();
    const catalogueService = {
      select: jest.fn().mockImplementation(async (selectedCriteria) => {
        expect(selectedCriteria).toEqual({
          hotelCodes: ["101", "102"],
          destinationCode: undefined,
          zoneCode: undefined,
          starGrading: undefined,
        });
        return { hotelCodes: ["101", "102"], selectionMode: "EXPLICIT" };
      }),
    };
    const requestBuilder = {
      build: jest.fn().mockImplementation((builtCriteria: AccommodationSearchCriteria) => {
        expect(builtCriteria).toEqual(criteria);
        return [{ operation: "availability", method: "POST", path: "/hotel-api/1.0/hotels", body: { stay: { checkIn: "2026-09-10", checkOut: "2026-09-14" }, sourceMarket: "ZA", occupancies: [{ rooms: 1, adults: 2, children: 0, paxes: [{ type: "AD" }, { type: "AD" }] }], hotels: { codes: [101] } } }];
      }),
    };

    const registry: ProviderRegistry = new InMemoryProviderRegistry();
    registry.register({
      providerId: "hotelbeds",
      capabilities: { capabilities: [] },
      async search() { return { accommodations: [], metadata: { generatedAt: new Date(), version: "1.0.0" } }; },
      async executeAvailabilityRequests() {
        return { provider: "hotelbeds", operation: "availability", completedAt: new Date(), responses: [] };
      },
      mapAvailabilityResponse() { return createAvailabilityResult("hotelbeds"); },
    } as never);

    const service = new DefaultAccommodationAvailabilityService(registry, catalogueService as never, requestBuilder as never);
    await service.execute({ criteria, context });

    expect(requestBuilder.build).toHaveBeenCalledWith(criteria, [{ hotelCode: "101" }, { hotelCode: "102" }]);
    expect(catalogueService.select).toHaveBeenCalledWith({
      hotelCodes: ["101", "102"],
      destinationCode: undefined,
      zoneCode: undefined,
      starGrading: undefined,
    });
  });
});

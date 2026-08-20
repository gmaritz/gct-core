import {
  AccommodationRateRevalidationRequest,
  AccommodationRateRevalidationService,
  Accommodation,
  AccommodationProviderCapabilityType,
  AccommodationRateOption,
  AccommodationRoomOption,
  HotelbedsProvider,
  InMemoryProviderRegistry,
  ProviderRegistry,
} from "@application/accommodation";

function createRate(status: "BOOKABLE" | "RECHECK_REQUIRED" = "RECHECK_REQUIRED"): AccommodationRateOption {
  return {
    reference: { provider: "hotelbeds", opaqueReference: "opaque-rate-key" },
    status,
    pricing: { amount: 100, currency: "ZAR", basis: "TOTAL_STAY" },
    occupancy: { rooms: [{ adults: 2, children: 1, childAges: [7] }] },
    board: { code: "BB", name: "BED AND BREAKFAST" },
    allotment: 2,
    payment: { type: "AT_WEB" },
    packaging: false,
    cancellationPolicies: [],
    taxes: [],
  };
}

function createRequest(rate = createRate()): AccommodationRateRevalidationRequest {
  const accommodation: Accommodation = {
    identity: { id: "100", name: "Test Hotel" },
    category: "Boutique Hotel",
    location: { country: "ZA", region: "WC", city: "Cape Town", suburb: "", latitude: 0, longitude: 0 },
    rating: { stars: 4, classification: "Premium" },
    images: [], amenities: [], policies: [], contacts: [],
    providerReference: { provider: "hotelbeds", providerAccommodationId: "100" },
  };
  const room: AccommodationRoomOption = {
    reference: { provider: "hotelbeds", opaqueReference: "room-code" },
    name: "Standard Room",
    rateOptions: [rate],
  };
  return {
    accommodation,
    room,
    rate,
    providerReference: rate.reference,
    stayPeriod: { checkIn: new Date("2026-09-10"), checkOut: new Date("2026-09-14") },
    occupancy: rate.occupancy,
    packageStopId: "stop-1",
  };
}

function createProviderRegistry(provider: object): ProviderRegistry {
  const registry = new InMemoryProviderRegistry();
  registry.register(provider as never);
  return registry;
}

function createProvider(checkRate: jest.Mock): HotelbedsProvider {
  const client = {
    searchHotels: jest.fn(),
    getHotelDetails: jest.fn(),
    getHotelContent: jest.fn(),
    getHotelImages: jest.fn(),
    getHotelRates: jest.fn(),
    checkRate,
  };
  return new HotelbedsProvider(client as never);
}

describe("APP-008.4 accommodation rate revalidation", () => {
  it("does not invoke CheckRate for BOOKABLE rates", async () => {
    const checkRate = jest.fn();
    const provider = createProvider(checkRate);
    const service = new AccommodationRateRevalidationService(createProviderRegistry(provider));

    const result = await service.execute(createRequest(createRate("BOOKABLE")));

    expect(result.status).toBe("VALID");
    expect(result.currentRate).toBe(result.previousRate);
    expect(checkRate).not.toHaveBeenCalled();
  });

  it("maps an unchanged CheckRate response to VALID", async () => {
    const checkRate = jest.fn().mockResolvedValue({
      status: 200,
      data: { rateKey: "opaque-rate-key", rateType: "RECHECK", net: "100.00", currency: "ZAR", rooms: 1, adults: 2, children: 1, childrenAges: "7", allotment: 2, boardCode: "BB", boardName: "BED AND BREAKFAST" },
    });
    const provider = createProvider(checkRate);
    const service = new AccommodationRateRevalidationService(createProviderRegistry(provider));
    const result = await service.execute(createRequest());

    expect(result.status).toBe("VALID");
    expect(checkRate).toHaveBeenCalledWith(expect.objectContaining({
      operation: "checkRate",
      method: "POST",
      path: "/hotel-api/1.0/checkrate",
      body: { rooms: [{ rateKey: "opaque-rate-key" }] },
    }));
  });

  it("maps changed supplier pricing to CHANGED and preserves the current rate", async () => {
    const checkRate = jest.fn().mockResolvedValue({
      status: 200,
      data: { rateKey: "opaque-rate-key", rateType: "BOOKABLE", sellingRate: "125.00", currency: "ZAR", rooms: 1, adults: 2, children: 1, childrenAges: "7", allotment: 2 },
    });
    const result = await new AccommodationRateRevalidationService(
      createProviderRegistry(createProvider(checkRate)),
    ).execute(createRequest());

    expect(result.status).toBe("CHANGED");
    expect(result.currentRate?.pricing.amount).toBe(125);
  });

  it("returns UNAVAILABLE for supplier business errors", async () => {
    const error = Object.assign(new Error("rate unavailable"), { code: "VALIDATION_ERROR" });
    const checkRate = jest.fn().mockRejectedValue(error);
    const result = await new AccommodationRateRevalidationService(
      createProviderRegistry(createProvider(checkRate)),
    ).execute(createRequest());

    expect(result.status).toBe("UNAVAILABLE");
    expect(result.error?.code).toBe("VALIDATION_ERROR");
  });

  it("returns FAILED for transport failures", async () => {
    const checkRate = jest.fn().mockRejectedValue(new Error("timeout"));
    const result = await new AccommodationRateRevalidationService(
      createProviderRegistry(createProvider(checkRate)),
    ).execute(createRequest());

    expect(result.status).toBe("FAILED");
    expect(result.error?.code).toBe("CHECK_RATE_FAILED");
  });

  it("advertises the provider revalidation capability", () => {
    const provider = createProvider(jest.fn());
    expect(provider.capabilities.capabilities.map((capability) => capability.type)).toContain(
      AccommodationProviderCapabilityType.REVALIDATION,
    );
  });
});
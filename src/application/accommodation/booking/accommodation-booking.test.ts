import {
  Accommodation,
  AccommodationBookingRequest,
  AccommodationBookingService,
  AccommodationProviderCapabilityType,
  AccommodationRateOption,
  AccommodationRoomOption,
  HotelbedsProvider,
  InMemoryProviderRegistry,
} from "@application/accommodation";

function createAccommodation(): Accommodation {
  return {
    identity: { id: "hotel-1", name: "Cape Hotel" },
    category: "Boutique Hotel",
    location: { country: "ZA", region: "WC", city: "Cape Town", suburb: "", latitude: 0, longitude: 0 },
    rating: { stars: 4, classification: "Premium" },
    images: [], amenities: [], policies: [], contacts: [],
    providerReference: { provider: "hotelbeds", providerAccommodationId: "hotel-1" },
  };
}

function createRate(status: "BOOKABLE" | "RECHECK_REQUIRED" = "BOOKABLE"): AccommodationRateOption {
  return {
    reference: { provider: "hotelbeds", opaqueReference: "opaque-rate" },
    status,
    pricing: { amount: 100, currency: "ZAR", basis: "TOTAL_STAY" },
    occupancy: { rooms: [{ adults: 1, children: 0, childAges: [] }, { adults: 1, children: 1, childAges: [7] }] },
    cancellationPolicies: [], taxes: [],
  };
}

function createRequest(status: "BOOKABLE" | "RECHECK_REQUIRED" = "BOOKABLE"): AccommodationBookingRequest {
  const rate = createRate(status);
  const room: AccommodationRoomOption = {
    reference: { provider: "hotelbeds", opaqueReference: "room-code" },
    name: "Family Room",
    rateOptions: [rate],
  };
  return {
    accommodation: createAccommodation(),
    room,
    rate,
    providerReference: rate.reference,
    stayPeriod: { checkIn: new Date("2026-09-10"), checkOut: new Date("2026-09-14") },
    occupancy: rate.occupancy,
    holder: { firstName: "Ari", lastName: "Jacobs", email: "ari@example.com", phone: "+27123456789" },
    guests: [
      { roomIndex: 0, type: "ADULT", firstName: "Ari", lastName: "Jacobs" },
      { roomIndex: 1, type: "ADULT", firstName: "Sam", lastName: "Jacobs" },
      { roomIndex: 1, type: "CHILD", firstName: "Leo", lastName: "Jacobs", age: 7 },
    ],
    packageStopId: "stop-1",
    idempotencyKey: "booking-request-1",
  };
}

function createProvider(book: jest.Mock): HotelbedsProvider {
  return new HotelbedsProvider({
    searchHotels: jest.fn(), getHotelDetails: jest.fn(), getHotelContent: jest.fn(),
    getHotelImages: jest.fn(), getHotelRates: jest.fn(), checkRate: jest.fn(), book,
  } as never);
}

describe("APP-008.5 accommodation booking", () => {
  it("creates a Hotelbeds booking with opaque reference, holder and room-associated guests", async () => {
    const book = jest.fn().mockResolvedValue({
      status: 200,
      data: { reference: "HB-BOOK-1", totalSellingRate: "125.50", currency: "ZAR" },
    });
    const provider = createProvider(book);
    const registry = new InMemoryProviderRegistry();
    registry.register(provider);

    const result = await new AccommodationBookingService(registry).execute(createRequest());

    expect(result.successful).toBe(true);
    expect(result.status).toBe("CONFIRMED");
    expect(result.supplierBookingReference).toBe("HB-BOOK-1");
    expect(result.supplierPrice).toEqual({ amount: 125.5, currency: "ZAR" });
    expect(book).toHaveBeenCalledWith(expect.objectContaining({
      operation: "booking",
      method: "POST",
      path: "/hotel-api/1.0/bookings",
      body: expect.objectContaining({
        clientReference: "booking-request-1",
        rooms: [
          { rateKey: "opaque-rate", paxes: [{ type: "AD", name: "Ari", surname: "Jacobs" }] },
          { rateKey: "opaque-rate", paxes: [
            { type: "AD", name: "Sam", surname: "Jacobs" },
            { type: "CH", name: "Leo", surname: "Jacobs", age: 7 },
          ] },
        ],
      }),
    }));
  });

  it("rejects RECHECK offers without successful revalidation", async () => {
    const registry = new InMemoryProviderRegistry();
    registry.register(createProvider(jest.fn()));
    await expect(new AccommodationBookingService(registry).execute(createRequest("RECHECK_REQUIRED")))
      .rejects.toThrow("successful revalidation");
  });

  it("accepts a revalidated RECHECK offer", async () => {
    const book = jest.fn().mockResolvedValue({ status: 200, data: { reference: "HB-BOOK-2" } });
    const request = createRequest("RECHECK_REQUIRED");
    const registry = new InMemoryProviderRegistry();
    registry.register(createProvider(book));
    const result = await new AccommodationBookingService(registry).execute({
      ...request,
      validatedRate: { ...request.rate, status: "BOOKABLE" },
    });
    expect(result.status).toBe("CONFIRMED");
  });

  it("distinguishes an unknown outcome when transport may have reached Hotelbeds", async () => {
    const error = Object.assign(new Error("timeout"), { code: "TIMEOUT" });
    const book = jest.fn().mockRejectedValue(error);
    const registry = new InMemoryProviderRegistry();
    registry.register(createProvider(book));
    const result = await new AccommodationBookingService(registry).execute(createRequest());
    expect(result.status).toBe("UNKNOWN");
    expect(result.successful).toBe(false);
  });

  it("advertises the booking capability", () => {
    const provider = createProvider(jest.fn());
    expect(provider.capabilities.capabilities.map((capability) => capability.type))
      .toContain(AccommodationProviderCapabilityType.BOOKING);
  });
});
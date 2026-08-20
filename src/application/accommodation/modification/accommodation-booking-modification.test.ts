import {
  AccommodationBookingModificationRequest,
  AccommodationBookingModificationService,
  AccommodationProviderCapabilityType,
  AccommodationBookingGuest,
  AccommodationBookingHolder,
  AccommodationAvailabilityOccupancy,
  HotelbedsProvider,
  InMemoryProviderRegistry,
} from "@application/accommodation";

function createRequest(status: "CONFIRMED" | "CANCELLED" | "UNKNOWN" = "CONFIRMED"): AccommodationBookingModificationRequest {
  const occupancy: AccommodationAvailabilityOccupancy = {
    rooms: [{ adults: 1, children: 0, childAges: [] }, { adults: 1, children: 1, childAges: [7] }],
  };
  const guests: ReadonlyArray<AccommodationBookingGuest> = [
    { roomIndex: 0, type: "ADULT", firstName: "Ari", lastName: "Jacobs" },
    { roomIndex: 1, type: "ADULT", firstName: "Sam", lastName: "Jacobs" },
    { roomIndex: 1, type: "CHILD", firstName: "Leo", lastName: "Jacobs", age: 7 },
  ];
  const holder: AccommodationBookingHolder = { firstName: "Ari", lastName: "Jacobs", email: "ari@example.com" };
  return {
    reservationId: "reservation-1",
    provider: "hotelbeds",
    supplierBookingReference: "HB-BOOK-1",
    reservationStatus: status,
    idempotencyKey: "modify-request-1",
    currentOccupancy: occupancy,
    changes: {
      stayPeriod: { checkIn: new Date("2026-09-11"), checkOut: new Date("2026-09-15") },
      occupancy,
      guests,
      holder,
    },
  };
}

function createProvider(modify: jest.Mock): HotelbedsProvider {
  return new HotelbedsProvider({
    searchHotels: jest.fn(), getHotelDetails: jest.fn(), getHotelContent: jest.fn(),
    getHotelImages: jest.fn(), getHotelRates: jest.fn(), checkRate: jest.fn(),
    book: jest.fn(), cancel: jest.fn(), modify,
  } as never);
}

describe("APP-008.7 accommodation booking modification", () => {
  it("rejects cancelled and unknown bookings before supplier execution", async () => {
    const modify = jest.fn();
    const registry = new InMemoryProviderRegistry();
    registry.register(createProvider(modify));
    await expect(new AccommodationBookingModificationService(registry).execute(createRequest("CANCELLED")))
      .rejects.toThrow("Cancelled");
    await expect(new AccommodationBookingModificationService(registry).execute(createRequest("UNKNOWN")))
      .rejects.toThrow("Unknown");
    expect(modify).not.toHaveBeenCalled();
  });

  it("returns UNSUPPORTED without supplier execution", async () => {
    const registry = new InMemoryProviderRegistry();
    const provider = { providerId: "supplier-b", capabilities: { capabilities: [] }, search: jest.fn() };
    registry.register(provider as never);
    const request = { ...createRequest(), provider: "supplier-b" };
    const result = await new AccommodationBookingModificationService(registry).execute(request);
    expect(result.status).toBe("UNSUPPORTED");
  });

  it("maps multi-room changes, holder, price and modification charge", async () => {
    const modify = jest.fn().mockResolvedValue({
      status: 200,
      data: { reference: "HB-BOOK-1", totalSellingRate: "145.00", currency: "ZAR", modificationCharge: { amount: "10.00", currency: "ZAR", description: "Change fee" } },
    });
    const registry = new InMemoryProviderRegistry();
    registry.register(createProvider(modify));
    const result = await new AccommodationBookingModificationService(registry).execute(createRequest());

    expect(result.status).toBe("MODIFIED");
    expect(result.supplierPrice).toEqual({ amount: 145, currency: "ZAR" });
    expect(result.modificationCharge).toEqual({ amount: 10, currency: "ZAR", description: "Change fee" });
    expect(modify).toHaveBeenCalledWith(expect.objectContaining({
      operation: "modification",
      body: expect.objectContaining({
        reference: "HB-BOOK-1",
        clientReference: "modify-request-1",
        stay: { checkIn: "2026-09-11", checkOut: "2026-09-15" },
        holder: { name: "Ari", surname: "Jacobs", email: "ari@example.com" },
        rooms: expect.arrayContaining([
          expect.objectContaining({ paxes: [{ type: "AD", name: "Ari", surname: "Jacobs" }] }),
        ]),
      }),
    }));
  });

  it("maps transport uncertainty to UNKNOWN without retrying", async () => {
    const error = Object.assign(new Error("timeout"), { code: "TIMEOUT" });
    const modify = jest.fn().mockRejectedValue(error);
    const registry = new InMemoryProviderRegistry();
    registry.register(createProvider(modify));
    const result = await new AccommodationBookingModificationService(registry).execute(createRequest());
    expect(result.status).toBe("UNKNOWN");
    expect(modify).toHaveBeenCalledTimes(1);
  });

  it("advertises modification as a provider capability", () => {
    const provider = createProvider(jest.fn());
    expect(provider.capabilities.capabilities.map((capability) => capability.type))
      .toContain(AccommodationProviderCapabilityType.MODIFICATION);
  });
});
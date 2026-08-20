import {
  AccommodationBookingDetailsRequest,
  AccommodationBookingDetailsService,
  AccommodationProviderCapabilityType,
  HotelbedsProvider,
  InMemoryProviderRegistry,
} from "@application/accommodation";

function createRequest(): AccommodationBookingDetailsRequest {
  return {
    reservationId: "reservation-1",
    provider: "hotelbeds",
    supplierBookingReference: "HB-BOOK-1",
    packageStopId: "stop-1",
  };
}

function createProvider(getBookingDetails: jest.Mock): HotelbedsProvider {
  return new HotelbedsProvider({
    searchHotels: jest.fn(), getHotelDetails: jest.fn(), getHotelContent: jest.fn(),
    getHotelImages: jest.fn(), getHotelRates: jest.fn(), checkRate: jest.fn(),
    book: jest.fn(), cancel: jest.fn(), modify: jest.fn(), getBookingDetails,
  } as never);
}

describe("APP-008.8 accommodation booking details", () => {
  it("retrieves the known booking through the original provider and maps current state", async () => {
    const getBookingDetails = jest.fn().mockResolvedValue({
      status: 200,
      data: {
        booking: {
          reference: "HB-BOOK-1",
          status: "CONFIRMED",
          currency: "ZAR",
          totalSellingRate: "250.00",
          checkIn: "2026-09-10",
          checkOut: "2026-09-14",
          cancellable: true,
          modifiable: true,
          holder: { name: "Ari", surname: "Jacobs", email: "ari@example.com" },
          hotel: {
            code: 100,
            name: "Cape Hotel",
            categoryName: "4 STARS",
            rooms: [{
              code: "FAM",
              name: "Family Room",
              paxes: [
                { type: "AD", name: "Ari", surname: "Jacobs" },
                { type: "CH", name: "Leo", surname: "Jacobs", age: 7 },
              ],
              rates: [{ rateKey: "booking-rate", sellingRate: "250.00", boardCode: "BB", boardName: "BED AND BREAKFAST" }],
            }],
          },
        },
      },
    });
    const registry = new InMemoryProviderRegistry();
    registry.register(createProvider(getBookingDetails));

    const result = await new AccommodationBookingDetailsService(registry).execute(createRequest());

    expect(result.successful).toBe(true);
    expect(result.status).toBe("CONFIRMED");
    expect(result.supplierPrice).toEqual({ amount: 250, currency: "ZAR" });
    expect(result.rooms).toHaveLength(1);
    expect(result.guests?.[1]).toMatchObject({ roomIndex: 0, type: "CHILD", age: 7 });
    expect(result.holder?.email).toBe("ari@example.com");
    expect(result.stayPeriod?.checkIn).toEqual(new Date("2026-09-10"));
    expect(result.cancellable).toBe(true);
    expect(result.modifiable).toBe(true);
    expect(getBookingDetails).toHaveBeenCalledWith(expect.objectContaining({
      operation: "booking-details",
      method: "GET",
      path: "/hotel-api/1.0/bookings/HB-BOOK-1",
    }));
  });

  it.each([
    ["CANCELLED", "CANCELLED"],
    ["MODIFIED", "MODIFIED"],
  ])("maps supplier %s state", async (supplierStatus, expectedStatus) => {
    const getBookingDetails = jest.fn().mockResolvedValue({ status: 200, data: { status: supplierStatus } });
    const registry = new InMemoryProviderRegistry();
    registry.register(createProvider(getBookingDetails));
    const result = await new AccommodationBookingDetailsService(registry).execute(createRequest());
    expect(result.status).toBe(expectedStatus);
  });

  it("maps transport failure to UNKNOWN without inferring cancellation", async () => {
    const error = Object.assign(new Error("timeout"), { code: "TIMEOUT" });
    const getBookingDetails = jest.fn().mockRejectedValue(error);
    const registry = new InMemoryProviderRegistry();
    registry.register(createProvider(getBookingDetails));
    const result = await new AccommodationBookingDetailsService(registry).execute(createRequest());
    expect(result.successful).toBe(false);
    expect(result.status).toBe("UNKNOWN");
    expect(result.status).not.toBe("CANCELLED");
    expect(getBookingDetails).toHaveBeenCalledTimes(1);
  });

  it("rejects provider mismatch and never searches an alternative provider", async () => {
    const getBookingDetails = jest.fn();
    const registry = new InMemoryProviderRegistry();
    registry.register(createProvider(getBookingDetails));
    await expect(new AccommodationBookingDetailsService(registry).execute({
      ...createRequest(), provider: "supplier-b",
    })).rejects.toThrow("does not match");
    expect(getBookingDetails).not.toHaveBeenCalled();
  });

  it("advertises booking-details retrieval", () => {
    const provider = createProvider(jest.fn());
    expect(provider.capabilities.capabilities.map((capability) => capability.type))
      .toContain(AccommodationProviderCapabilityType.BOOKING_DETAILS);
  });
});
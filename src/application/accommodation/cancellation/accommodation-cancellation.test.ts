import {
  AccommodationCancellationRequest,
  AccommodationCancellationService,
  AccommodationProviderCapabilityType,
  HotelbedsProvider,
  InMemoryProviderRegistry,
} from "@application/accommodation";

function createRequest(status: "CONFIRMED" | "CANCELLED" = "CONFIRMED"): AccommodationCancellationRequest {
  return {
    reservationId: "reservation-1",
    provider: "hotelbeds",
    supplierBookingReference: "HB-BOOK-1",
    reservationStatus: status,
    idempotencyKey: "cancel-request-1",
    packageStopId: "stop-1",
  };
}

function createProvider(cancel: jest.Mock): HotelbedsProvider {
  return new HotelbedsProvider({
    searchHotels: jest.fn(), getHotelDetails: jest.fn(), getHotelContent: jest.fn(),
    getHotelImages: jest.fn(), getHotelRates: jest.fn(), checkRate: jest.fn(),
    book: jest.fn(), cancel,
  } as never);
}

describe("APP-008.6 accommodation cancellation", () => {
  it("returns an idempotent already-cancelled result without supplier execution", async () => {
    const cancel = jest.fn();
    const registry = new InMemoryProviderRegistry();
    registry.register(createProvider(cancel));
    const result = await new AccommodationCancellationService(registry).execute(createRequest("CANCELLED"));

    expect(result.successful).toBe(true);
    expect(result.status).toBe("ALREADY_CANCELLED");
    expect(cancel).not.toHaveBeenCalled();
  });

  it("cancels using the supplier booking reference and preserves charges", async () => {
    const cancel = jest.fn().mockResolvedValue({
      status: 200,
      data: { status: "CANCELLED", cancellationAmount: { amount: "25.50", currency: "ZAR", description: "Supplier fee" } },
    });
    const registry = new InMemoryProviderRegistry();
    registry.register(createProvider(cancel));
    const result = await new AccommodationCancellationService(registry).execute(createRequest());

    expect(result.status).toBe("CANCELLED");
    expect(result.charge).toEqual({ amount: 25.5, currency: "ZAR", description: "Supplier fee" });
    expect(cancel).toHaveBeenCalledWith(expect.objectContaining({
      operation: "cancellation",
      method: "POST",
      path: "/hotel-api/1.0/bookings",
      body: {
        reference: "HB-BOOK-1",
        cancellation: true,
        clientReference: "cancel-request-1",
      },
    }));
  });

  it("rejects a provider mismatch before supplier execution", async () => {
    const cancel = jest.fn();
    const registry = new InMemoryProviderRegistry();
    registry.register(createProvider(cancel));
    await expect(new AccommodationCancellationService(registry).execute({
      ...createRequest(), provider: "supplier-b",
    })).rejects.toThrow("does not match");
    expect(cancel).not.toHaveBeenCalled();
  });

  it("maps supplier rejection to FAILED without claiming cancellation", async () => {
    const error = Object.assign(new Error("booking rejected"), { code: "VALIDATION_ERROR" });
    const cancel = jest.fn().mockRejectedValue(error);
    const registry = new InMemoryProviderRegistry();
    registry.register(createProvider(cancel));
    const result = await new AccommodationCancellationService(registry).execute(createRequest());

    expect(result.successful).toBe(false);
    expect(result.status).toBe("FAILED");
  });

  it("maps transport uncertainty to UNKNOWN without retrying", async () => {
    const error = Object.assign(new Error("timeout"), { code: "TIMEOUT" });
    const cancel = jest.fn().mockRejectedValue(error);
    const registry = new InMemoryProviderRegistry();
    registry.register(createProvider(cancel));
    const result = await new AccommodationCancellationService(registry).execute(createRequest());

    expect(result.status).toBe("UNKNOWN");
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it("advertises cancellation as a provider capability", () => {
    const provider = createProvider(jest.fn());
    expect(provider.capabilities.capabilities.map((capability) => capability.type))
      .toContain(AccommodationProviderCapabilityType.CANCELLATION);
  });
});
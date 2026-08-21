import {
  createAccommodationBookingRequests,
  createAccommodationReservationSnapshots,
  AccommodationReservationHandoffInput,
} from "@application/reservations";
import { JourneyAccommodationPricingInput, JourneyAccommodationReservationInput } from "@application/journeys/models";

function createInput(stopId: string, rateStatus: "BOOKABLE" | "RECHECK_REQUIRED", amount: number): {
  pricing: JourneyAccommodationPricingInput;
  reservation: JourneyAccommodationReservationInput;
} {
  const accommodation = {
    identity: { id: `hotel-${stopId}`, name: `Hotel ${stopId}` },
    category: "Boutique Hotel" as const,
    location: { country: "ZA", region: "WC", city: "Cape Town", suburb: "", latitude: 0, longitude: 0 },
    rating: { stars: 4, classification: "Premium" },
    images: [], amenities: [], policies: [], contacts: [],
    providerReference: { provider: "hotelbeds", providerAccommodationId: `hotel-${stopId}` },
  };
  const rate = {
    reference: { provider: "hotelbeds", opaqueReference: `rate-${stopId}` },
    status: rateStatus,
    pricing: { amount, currency: "ZAR", basis: "TOTAL_STAY" },
    occupancy: { rooms: [{ adults: 2, children: 1, childAges: [8] }, { adults: 2, children: 0, childAges: [] }] },
    cancellationPolicies: [], taxes: [],
  };
  const room = {
    reference: { provider: "hotelbeds", opaqueReference: `room-${stopId}` },
    name: "Deluxe Room",
    rateOptions: [rate],
  };
  const common = {
    packageStopId: stopId,
    accommodation,
    stayPeriod: { checkIn: new Date("2026-10-10"), checkOut: new Date("2026-10-14") },
    accommodationId: accommodation.identity.id,
    room,
    rate,
    occupancy: rate.occupancy,
  };
  return {
    pricing: common as JourneyAccommodationPricingInput,
    reservation: { ...common, provider: "hotelbeds", supplierReference: rate.reference } as JourneyAccommodationReservationInput,
  };
}

function createHandoff(inputs: ReadonlyArray<ReturnType<typeof createInput>>): AccommodationReservationHandoffInput {
  return {
    packageId: "package-1",
    pricingInputs: inputs.map((input) => input.pricing),
    reservationInputs: inputs.map((input) => input.reservation),
    finalPackagePrice: { amount: 12000, currency: "ZAR" },
    holder: { firstName: "Ari", lastName: "Jacobs", email: "ari@example.com" },
    guests: [
      { roomIndex: 0, type: "ADULT", firstName: "Ari", lastName: "Jacobs" },
      { roomIndex: 0, type: "CHILD", firstName: "Leo", lastName: "Jacobs", age: 8 },
      { roomIndex: 1, type: "ADULT", firstName: "Sam", lastName: "Jacobs" },
    ],
    idempotencyKey: "reservation-request-1",
  };
}

describe("APP-004 pricing-to-reservation accommodation handoff", () => {
  it("preserves independent multi-stop accommodation snapshots", () => {
    const handoff = createHandoff([
      createInput("stop-1", "BOOKABLE", 250),
      createInput("stop-2", "BOOKABLE", 400),
      createInput("stop-3", "RECHECK_REQUIRED", 600),
    ]);
    const snapshots = createAccommodationReservationSnapshots(handoff);

    expect(snapshots).toHaveLength(3);
    expect(snapshots.map((snapshot) => snapshot.packageStopId)).toEqual(["stop-1", "stop-2", "stop-3"]);
    expect(snapshots.map((snapshot) => snapshot.supplierPrice?.amount)).toEqual([250, 400, 600]);
    expect(snapshots[0]?.rateReference?.opaqueReference).toBe("rate-stop-1");
    expect(snapshots[0]?.occupancy?.rooms[0]?.childAges).toEqual([8]);
  });

  it("constructs canonical booking requests without supplier DTOs", () => {
    const requests = createAccommodationBookingRequests(createHandoff([createInput("stop-1", "BOOKABLE", 250)]));
    expect(requests).toHaveLength(1);
    expect(requests[0]?.providerReference.opaqueReference).toBe("rate-stop-1");
    expect(requests[0]?.stayPeriod.checkIn).toEqual(new Date("2026-10-10"));
    expect(requests[0]?.guests[1]).toMatchObject({ roomIndex: 0, type: "CHILD", age: 8 });
    expect(requests[0]?.idempotencyKey).toBe("reservation-request-1-stop-1");
  });

  it("preserves RECHECK continuity for downstream revalidation", () => {
    const input = createInput("stop-1", "RECHECK_REQUIRED", 250);
    const snapshots = createAccommodationReservationSnapshots(createHandoff([input]));
    expect(snapshots[0]?.rateReference?.opaqueReference).toBe("rate-stop-1");
  });

  it("rejects missing, invalid, and duplicate accommodation selections", () => {
    expect(() => createAccommodationReservationSnapshots({
      ...createHandoff([createInput("stop-1", "BOOKABLE", 250)]),
      pricingInputs: [],
    })).toThrow("At least one accommodation pricing input");

    const invalid = createInput("stop-1", "BOOKABLE", 0);
    expect(() => createAccommodationReservationSnapshots(createHandoff([invalid]))).toThrow("positive supplier price");

    expect(() => createAccommodationReservationSnapshots(createHandoff([
      createInput("stop-1", "BOOKABLE", 250),
      createInput("stop-1", "BOOKABLE", 300),
    ]))).toThrow("unique package stops");
  });
});

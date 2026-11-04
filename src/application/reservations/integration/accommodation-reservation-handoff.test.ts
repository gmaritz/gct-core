import {
  createAccommodationBookingRequests,
  createAccommodationReservationSnapshots,
  AccommodationReservationHandoffInput,
} from "@application/reservations";
import { JourneyAccommodationPricingInput, JourneyAccommodationReservationInput } from "@application/journeys/models";

function createInput(stopId: string, rateStatus: "BOOKABLE" | "RECHECK_REQUIRED", amount: number, currency = "ZAR"): {
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
  const occupancies = [
    { adults: 2, children: 1, childAges: [8] },
    { adults: 2, children: 0, childAges: [] },
  ];
  const rate = {
    reference: { provider: "hotelbeds", opaqueReference: `rate-${stopId}` },
    status: rateStatus,
    pricing: { amount, currency, basis: "TOTAL_STAY" },
    occupancy: { rooms: occupancies },
    cancellationPolicies: [], taxes: [],
  };
  const room = {
    reference: { provider: "hotelbeds", opaqueReference: `room-${stopId}` },
    name: "Deluxe Room",
    rateOptions: [rate],
  };
  const firstRate = {
    ...rate,
    pricing: { amount: amount / 2, currency, basis: "TOTAL_STAY" },
    occupancy: { rooms: [occupancies[0]!] },
  };
  const secondRate = {
    ...rate,
    reference: { provider: "hotelbeds", opaqueReference: `rate-${stopId}-second` },
    pricing: { amount: amount / 2, currency, basis: "TOTAL_STAY" },
    occupancy: { rooms: [occupancies[1]!] },
  };
  const secondRoom = {
    reference: { provider: "hotelbeds", opaqueReference: `room-${stopId}-second` },
    name: "Second Deluxe Room",
    rateOptions: [secondRate],
  };
  const common = {
    packageStopId: stopId,
    accommodation,
    stayPeriod: { checkIn: new Date("2026-10-10"), checkOut: new Date("2026-10-14") },
    accommodationId: accommodation.identity.id,
    room,
    rate,
    roomRates: [
      { roomSlotId: `${stopId}-room-1`, room, rate: firstRate },
      { roomSlotId: `${stopId}-room-2`, room: secondRoom, rate: secondRate },
    ],
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
      { roomIndex: 1, type: "ADULT", firstName: "Nia", lastName: "Jacobs" },
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
    expect(requests).toHaveLength(2);
    expect(requests[0]?.providerReference.opaqueReference).toBe("rate-stop-1");
    expect(requests[0]?.stayPeriod.checkIn).toEqual(new Date("2026-10-10"));
    expect(requests[0]?.guests[1]).toMatchObject({ roomIndex: 0, type: "CHILD", age: 8 });
    expect(requests[0]?.idempotencyKey).toBe("reservation-request-1-stop-1-room-1");
    expect(requests[1]?.occupancy.rooms).toEqual([{ adults: 2, children: 0, childAges: [] }]);
  });

  it("preserves each selected room, rate, price, occupancy and guest assignment", () => {
    const input = createInput("stop-1", "BOOKABLE", 250);
    const firstRate = {
      ...input.pricing.rate,
      pricing: { amount: 250, currency: "ZAR", basis: "TOTAL_STAY" },
      occupancy: { rooms: [{ adults: 1, children: 1, childAges: [8] }] },
    };
    const secondRate = {
      ...input.pricing.rate,
      reference: { provider: "hotelbeds", opaqueReference: "rate-stop-1-second" },
      pricing: { amount: 300, currency: "ZAR", basis: "TOTAL_STAY" },
      occupancy: { rooms: [{ adults: 1, children: 0, childAges: [] }] },
    };
    const secondRoom = {
      ...input.pricing.room,
      reference: { provider: "hotelbeds", opaqueReference: "room-stop-1-second" },
      rateOptions: [secondRate],
    };
    const pricing = {
      ...input.pricing,
      rate: {
        ...firstRate,
        pricing: { amount: 550, currency: "ZAR", basis: "TOTAL_STAY" },
        occupancy: { rooms: [...firstRate.occupancy.rooms, ...secondRate.occupancy.rooms] },
      },
      roomRates: [
        { roomSlotId: "stop-1-room-1", room: input.pricing.room, rate: firstRate },
        { roomSlotId: "stop-1-room-2", room: secondRoom, rate: secondRate },
      ],
      occupancy: { rooms: [...firstRate.occupancy.rooms, ...secondRate.occupancy.rooms] },
    } as JourneyAccommodationPricingInput;
    const reservation = {
      ...input.reservation,
      ...pricing,
      provider: "hotelbeds",
      supplierReference: firstRate.reference,
    } as JourneyAccommodationReservationInput;
    const handoff = createHandoff([{ pricing, reservation }]);
    const bookings = createAccommodationBookingRequests(handoff);
    const snapshots = createAccommodationReservationSnapshots(handoff);

    expect(bookings).toHaveLength(2);
    expect(bookings.map((booking) => booking.rate.reference.opaqueReference)).toEqual([
      "rate-stop-1",
      "rate-stop-1-second",
    ]);
    expect(bookings.map((booking) => booking.occupancy.rooms[0]?.adults)).toEqual([1, 1]);
    expect(bookings.map((booking) => booking.guests.map((guest) => guest.firstName))).toEqual([
      ["Ari", "Leo"],
      ["Sam", "Nia"],
    ]);
    expect(bookings.map((booking) => booking.idempotencyKey)).toEqual([
      "reservation-request-1-stop-1-room-1",
      "reservation-request-1-stop-1-room-2",
    ]);
    expect(snapshots[0]?.supplierPrice?.amount).toBe(550);
    expect(snapshots[0]?.selectedRooms?.map((room) => room.supplierPrice.amount)).toEqual([250, 300]);
    expect(snapshots[0]?.selectedRooms?.map((room) => room.roomSlotId)).toEqual(["stop-1-room-1", "stop-1-room-2"]);
    expect(snapshots[0]?.selectedRooms?.map((room) => room.occupancy?.childAges)).toEqual([[8], []]);
  });

  it("CUR-001 preserves EUR supplier amounts and currency beside the ZAR final package price", () => {
    const handoff = createHandoff([createInput("stop-1", "BOOKABLE", 250, "EUR")]);
    const [snapshot] = createAccommodationReservationSnapshots(handoff);
    const bookings = createAccommodationBookingRequests(handoff);

    expect(handoff.finalPackagePrice).toEqual({ amount: 12000, currency: "ZAR" });
    expect(snapshot?.supplierPrice).toEqual({ amount: 250, currency: "EUR", basis: "TOTAL_STAY" });
    expect(snapshot?.selectedRooms?.map((room) => room.supplierPrice)).toEqual([
      { amount: 125, currency: "EUR", basis: "TOTAL_STAY" },
      { amount: 125, currency: "EUR", basis: "TOTAL_STAY" },
    ]);
    expect(bookings.map((booking) => booking.rate.pricing.currency)).toEqual(["EUR", "EUR"]);
  });

  it("CUR-001 rejects mixed supplier currencies within one stop at the handoff boundary", () => {
    const input = createInput("stop-1", "BOOKABLE", 250, "EUR");
    const mixed = {
      ...input.pricing,
      roomRates: input.pricing.roomRates!.map((roomRate, index) => index === 1
        ? { ...roomRate, rate: { ...roomRate.rate, pricing: { ...roomRate.rate.pricing, currency: "ZAR" } } }
        : roomRate),
    } as JourneyAccommodationPricingInput;

    expect(() => createAccommodationReservationSnapshots(createHandoff([{
      pricing: mixed,
      reservation: { ...input.reservation, roomRates: mixed.roomRates } as JourneyAccommodationReservationInput,
    }]))).toThrow("incompatible currencies");
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

  it("rejects a multi-room allocation without one selected rate per room slot", () => {
    const input = createInput("stop-1", "BOOKABLE", 250);
    const invalidPricing = { ...input.pricing, roomRates: undefined };
    const invalidReservation = { ...input.reservation, roomRates: undefined };

    expect(() => createAccommodationReservationSnapshots(createHandoff([{
      pricing: invalidPricing,
      reservation: invalidReservation,
    }]))).toThrow("Every requested room slot must retain one selected room and rate.");
  });
});

import { Reservation, ReservationComposition, ReservationStatus } from "@application/reservations/aggregate";
import { ReservationTimelineMilestone } from "@application/reservations/models";

function createComposition(): ReservationComposition {
  return {
    identity: {
      id: "reservation-001",
    },
    reservationNumber: "RES-123456-ABCD",
    status: ReservationStatus.CREATED,
    journeySnapshot: {
      snapshotId: "journey-snap-001",
      capturedAt: new Date("2026-08-06T08:00:00.000Z"),
      version: "1.0.0",
      journeyId: "journey-1001",
      title: "Cape Winelands Signature",
      destination: "Cape Winelands",
      duration: "4 days / 3 nights",
      accommodationSummary: "Luxury retreat",
      experienceSummary: "Private tastings",
      startDate: new Date("2026-08-10T00:00:00.000Z"),
      endDate: new Date("2026-08-14T00:00:00.000Z"),
      summary: "4-night curated journey",
    },
    travellerSnapshots: [
      {
        snapshotId: "traveller-snap-001",
        capturedAt: new Date("2026-08-06T08:00:00.000Z"),
        version: "1.0.0",
        travellerId: "traveller-001",
        fullName: "Ari Jacobs",
        email: "ari@example.com",
        nationality: "South African",
        travellerType: "Adult",
        dateOfBirth: new Date("1990-02-14T00:00:00.000Z"),
      },
    ],
    accommodationSnapshots: [
      {
        snapshotId: "accommodation-snap-001",
        capturedAt: new Date("2026-08-06T08:00:00.000Z"),
        version: "1.0.0",
        accommodationId: "acc-001",
        propertyName: "Table Mountain Lodge",
        checkInDate: new Date("2026-08-10T15:00:00.000Z"),
        checkOutDate: new Date("2026-08-14T10:00:00.000Z"),
        roomType: "Deluxe Suite",
        mealBasis: "Breakfast",
      },
    ],
    pricingSnapshot: {
      snapshotId: "pricing-snap-001",
      capturedAt: new Date("2026-08-06T08:00:00.000Z"),
      version: "1.0.0",
      currency: "ZAR",
      totalPrice: 46000,
      taxes: 6000,
      discounts: 1000,
      fees: 500,
    },
    paymentSnapshot: {
      snapshotId: "payment-snap-001",
      capturedAt: new Date("2026-08-06T08:00:00.000Z"),
      version: "1.0.0",
      paymentStatus: "PENDING",
      paymentMethod: "CARD",
      amountReceived: 10000,
      balanceOutstanding: 36000,
    },
    supplierReferences: [
      {
        snapshotId: "supplier-snap-001",
        capturedAt: new Date("2026-08-06T08:00:00.000Z"),
        version: "1.0.0",
        providerId: "hotelbeds",
        supplierBookingReference: "hb-7788",
        confirmationNumber: "CONF-001",
      },
    ],
    timeline: [
      {
        snapshotId: "timeline-snap-001",
        capturedAt: new Date("2026-08-06T08:00:00.000Z"),
        version: "1.0.0",
        milestone: ReservationTimelineMilestone.CREATED,
        occurredAt: new Date("2026-08-06T08:00:00.000Z"),
      },
    ],
    metadata: {
      createdAt: new Date("2026-08-06T08:00:00.000Z"),
      updatedAt: new Date("2026-08-06T08:00:00.000Z"),
      version: "1.0.0",
    },
  };
}

describe("Reservation aggregate", () => {
  it("constructs an immutable reservation aggregate", () => {
    const reservation = Reservation.create(createComposition());

    expect(reservation.identity.id).toBe("reservation-001");
    expect(reservation.reservationNumber).toBe("RES-123456-ABCD");
    expect(reservation.status).toBe(ReservationStatus.CREATED);
    expect(reservation.journeySnapshot.journeyId).toBe("journey-1001");
    expect(reservation.travellerSnapshots).toHaveLength(1);
    expect(reservation.accommodationSnapshots).toHaveLength(1);
    expect(reservation.metadata.version).toBe("1.0.0");
    expect(Object.isFrozen(reservation)).toBe(true);
  });

  it("freezes nested contracts and readonly collections", () => {
    const reservation = Reservation.create(createComposition());

    expect(Object.isFrozen(reservation.identity)).toBe(true);
    expect(Object.isFrozen(reservation.journeySnapshot)).toBe(true);
    expect(Object.isFrozen(reservation.travellerSnapshots)).toBe(true);
    expect(Object.isFrozen(reservation.accommodationSnapshots)).toBe(true);
    expect(Object.isFrozen(reservation.supplierReferences)).toBe(true);
    expect(Object.isFrozen(reservation.timeline)).toBe(true);
    expect(Object.isFrozen(reservation.metadata)).toBe(true);

    expect(() => {
      (reservation.travellerSnapshots as unknown as TravellerMutation).push({ travellerId: "x", fullName: "x" });
    }).toThrow(TypeError);
  });

  it("protects aggregate state from input object mutation", () => {
    const composition = createComposition();
    const reservation = Reservation.create(composition);
    const mutableIdentity = composition.identity as { id: string };
    const mutableTravellers = composition.travellerSnapshots as unknown as Array<{ travellerId: string; fullName: string }>;

    mutableIdentity.id = "reservation-mutated";
    mutableTravellers[0] = {
      travellerId: "traveller-mutated",
      fullName: "Mutation",
    };

    expect(reservation.identity.id).toBe("reservation-001");
    expect(reservation.travellerSnapshots[0]?.travellerId).toBe("traveller-001");
  });

  it("fails construction when required invariants are missing", () => {
    const missingIdentity = {
      ...createComposition(),
      identity: {
        id: "",
      },
    };

    const missingTravellers = {
      ...createComposition(),
      travellerSnapshots: [],
    };

    const missingReservationNumber = {
      ...createComposition(),
      reservationNumber: "",
    };

    expect(() => Reservation.create(missingIdentity)).toThrow("Reservation identity is required.");
    expect(() => Reservation.create(missingTravellers)).toThrow("At least one traveller snapshot is required.");
    expect(() => Reservation.create(missingReservationNumber)).toThrow("Reservation number is required.");
  });

  it("supports restore for immutable historical snapshots", () => {
    const composition = createComposition();
    const reservation = Reservation.restore(composition);

    expect(reservation.identity.id).toBe(composition.identity.id);
    expect(reservation.timeline.map((entry) => entry.milestone)).toEqual([ReservationTimelineMilestone.CREATED]);
  });
});

type TravellerMutation = Array<{ travellerId: string; fullName: string }>;

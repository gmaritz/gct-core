import {
  AccommodationSnapshot,
  JourneySnapshot,
  PaymentSnapshot,
  PricingSnapshot,
  ReservationMetadata,
  ReservationSnapshot,
  ReservationTimeline,
  ReservationTimelineEntry,
  ReservationTimelineMilestone,
  SupplierReference,
  TravellerSnapshot,
} from "@application/reservations/models";

describe("Reservation snapshot model library", () => {
  it("constructs snapshot contracts with required versioning fields", () => {
    const baseSnapshot: ReservationSnapshot = {
      snapshotId: "snapshot-001",
      capturedAt: new Date("2026-08-07T09:00:00.000Z"),
      version: "1.0.0",
    };

    expect(baseSnapshot.snapshotId).toBe("snapshot-001");
    expect(baseSnapshot.version).toBe("1.0.0");
  });

  it("constructs immutable journey and traveller snapshots", () => {
    const journeySnapshot: JourneySnapshot = {
      snapshotId: "journey-snap-001",
      capturedAt: new Date("2026-08-07T09:05:00.000Z"),
      version: "1.0.0",
      journeyId: "journey-001",
      title: "Cape Signature Journey",
      destination: "Cape Town",
      duration: "4 days / 3 nights",
      accommodationSummary: "Boutique retreat",
      experienceSummary: "Private tastings",
    };

    const travellerSnapshot: TravellerSnapshot = {
      snapshotId: "traveller-snap-001",
      capturedAt: new Date("2026-08-07T09:05:00.000Z"),
      version: "1.0.0",
      travellerId: "traveller-001",
      fullName: "Ari Jacobs",
      email: "ari@example.com",
      nationality: "South African",
      travellerType: "Adult",
    };

    expect(journeySnapshot.journeyId).toBe("journey-001");
    expect(travellerSnapshot.fullName).toBe("Ari Jacobs");
  });

  it("constructs accommodation, pricing, payment and supplier contracts", () => {
    const accommodationSnapshot: AccommodationSnapshot = {
      snapshotId: "accommodation-snap-001",
      capturedAt: new Date("2026-08-07T09:10:00.000Z"),
      version: "1.0.0",
      accommodationId: "accommodation-001",
      propertyName: "Table Mountain Lodge",
      roomType: "Suite",
      mealBasis: "Breakfast",
    };

    const pricingSnapshot: PricingSnapshot = {
      snapshotId: "pricing-snap-001",
      capturedAt: new Date("2026-08-07T09:10:00.000Z"),
      version: "1.0.0",
      currency: "ZAR",
      totalPrice: 46000,
      taxes: 6000,
      discounts: 1000,
      fees: 500,
    };

    const paymentSnapshot: PaymentSnapshot = {
      snapshotId: "payment-snap-001",
      capturedAt: new Date("2026-08-07T09:10:00.000Z"),
      version: "1.0.0",
      paymentStatus: "PENDING",
      paymentMethod: "CARD",
      amountReceived: 10000,
      balanceOutstanding: 36000,
    };

    const supplierReference: SupplierReference = {
      snapshotId: "supplier-snap-001",
      capturedAt: new Date("2026-08-07T09:10:00.000Z"),
      version: "1.0.0",
      providerId: "hotelbeds",
      supplierBookingReference: "HB-7788",
      confirmationNumber: "CONF-1234",
    };

    expect(accommodationSnapshot.propertyName).toBe("Table Mountain Lodge");
    expect(pricingSnapshot.totalPrice).toBe(46000);
    expect(paymentSnapshot.balanceOutstanding).toBe(36000);
    expect(supplierReference.providerId).toBe("hotelbeds");
  });

  it("constructs timeline and metadata with readonly collection semantics", () => {
    const entry: ReservationTimelineEntry = {
      snapshotId: "timeline-snap-001",
      capturedAt: new Date("2026-08-07T09:15:00.000Z"),
      version: "1.0.0",
      milestone: ReservationTimelineMilestone.CREATED,
      occurredAt: new Date("2026-08-07T09:15:00.000Z"),
      note: "Reservation created",
    };

    const timeline: ReservationTimeline = Object.freeze([Object.freeze(entry)]);

    const metadata: ReservationMetadata = {
      createdAt: new Date("2026-08-07T09:15:00.000Z"),
      updatedAt: new Date("2026-08-07T09:20:00.000Z"),
      version: "1.0.0",
    };

    expect(timeline).toHaveLength(1);
    expect(timeline[0]?.milestone).toBe(ReservationTimelineMilestone.CREATED);
    expect(metadata.version).toBe("1.0.0");
    expect(Object.isFrozen(timeline)).toBe(true);
  });
});

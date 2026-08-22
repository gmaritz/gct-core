import { Reservation, ReservationStatus } from "@application/reservations/aggregate";
import { ReservationTimelineMilestone } from "@application/reservations/models";
import { ReservationResult } from "@application/reservations/service";

import { ReservationPresentationMapper } from "./reservation-presentation-mapper";
import { ReservationViewModelProvider } from "./reservation-view-model-provider";

function createReservation(): Reservation {
  return Reservation.create({
    identity: { id: "reservation-0101" },
    reservationNumber: "RES-010101-PRS1",
    status: ReservationStatus.QUOTED,
    journeySnapshot: {
      snapshotId: "journey-snap-0101",
      capturedAt: new Date("2026-08-07T10:00:00.000Z"),
      version: "1.0.0",
      journeyId: "journey-3001",
      title: "Cape Explorer Signature",
      destination: "Cape Peninsula",
      duration: "5 days / 4 nights",
      accommodationSummary: "Coastal boutique stay",
      experienceSummary: "Scenic and culinary highlights",
    },
    travellerSnapshots: [
      {
        snapshotId: "traveller-snap-0101",
        capturedAt: new Date("2026-08-07T10:00:00.000Z"),
        version: "1.0.0",
        travellerId: "traveller-0101",
        fullName: "Ari Jacobs",
      },
      {
        snapshotId: "traveller-snap-0102",
        capturedAt: new Date("2026-08-07T10:00:00.000Z"),
        version: "1.0.0",
        travellerId: "traveller-0102",
        fullName: "Mika Jacobs",
      },
    ],
    accommodationSnapshots: [
      {
        snapshotId: "accommodation-snap-0101",
        capturedAt: new Date("2026-08-07T10:00:00.000Z"),
        version: "1.0.0",
        accommodationId: "acc-0101",
        propertyName: "Harbour View House",
        roomType: "Suite",
      },
      {
        snapshotId: "accommodation-snap-0102",
        capturedAt: new Date("2026-08-07T10:00:00.000Z"),
        version: "1.0.0",
        accommodationId: "acc-0102",
        propertyName: "Vineyard Lodge",
        roomType: "Deluxe",
      },
    ],
    pricingSnapshot: {
      snapshotId: "pricing-snap-0101",
      capturedAt: new Date("2026-08-07T10:00:00.000Z"),
      version: "1.0.0",
      currency: "ZAR",
      totalPrice: 52000,
      taxes: 6000,
      discounts: 1500,
      fees: 500,
    },
    paymentSnapshot: {
      snapshotId: "payment-snap-0101",
      capturedAt: new Date("2026-08-07T10:00:00.000Z"),
      version: "1.0.0",
      paymentStatus: "PARTIAL",
      amountReceived: 14000,
      balanceOutstanding: 38000,
    },
    timeline: [
      {
        snapshotId: "timeline-snap-0101",
        capturedAt: new Date("2026-08-07T10:00:00.000Z"),
        version: "1.0.0",
        milestone: ReservationTimelineMilestone.CREATED,
        occurredAt: new Date("2026-08-07T10:00:00.000Z"),
      },
      {
        snapshotId: "timeline-snap-0102",
        capturedAt: new Date("2026-08-07T11:00:00.000Z"),
        version: "1.0.0",
        milestone: ReservationTimelineMilestone.QUOTED,
        occurredAt: new Date("2026-08-07T11:00:00.000Z"),
        note: "Client accepted itinerary draft",
      },
    ],
    metadata: {
      createdAt: new Date("2026-08-07T10:00:00.000Z"),
      updatedAt: new Date("2026-08-07T11:00:00.000Z"),
      version: "1.0.0",
    },
  });
}

function createReservationResult(overrides?: Partial<ReservationResult>): ReservationResult {
  const base: ReservationResult = Object.freeze({
    successful: true,
    reservation: createReservation(),
    errors: Object.freeze([]),
    warnings: Object.freeze(["Payment window closes in 48 hours"]),
    metadata: Object.freeze({
      generatedAt: new Date("2026-08-07T11:15:00.000Z"),
      version: "1.0.0",
      requestId: "reservation-request-0101",
    }),
  });

  if (!overrides) {
    return base;
  }

  return Object.freeze({
    successful: overrides.successful ?? base.successful,
    reservation: typeof overrides.reservation === "undefined" ? base.reservation : overrides.reservation,
    errors: Object.freeze([...(overrides.errors ?? base.errors)]),
    warnings: Object.freeze([...(overrides.warnings ?? base.warnings)]),
    metadata: Object.freeze({
      generatedAt: new Date((overrides.metadata?.generatedAt ?? base.metadata.generatedAt).getTime()),
      version: overrides.metadata?.version ?? base.metadata.version,
      requestId: overrides.metadata?.requestId ?? base.metadata.requestId,
    }),
  });
}

describe("ReservationPresentationMapper", () => {
  it("transforms reservation results into commercial and lifecycle models", () => {
    const mapper = new ReservationPresentationMapper();
    const output = mapper.map(createReservationResult());

    expect(output).not.toBeNull();
    expect(output?.reservation.reservationNumber).toBe("RES-010101-PRS1");
    expect(output?.reservation.travellers.travellerCount).toBe(2);
    expect(output?.reservation.accommodationSummary).toBe("Harbour View House +1 more");
    expect(output?.reservation.pricingSummary?.display).toBe("ZAR 52000.00");
    expect(output?.lifecycle.status).toBe(ReservationStatus.QUOTED);
    expect(output?.lifecycle.bookingProgress.percentage).toBe(40);
    expect(output?.lifecycle.outstandingActions).toEqual([
      "Settle outstanding balance",
      "Confirm reservation",
      "Await supplier confirmation",
    ]);
    expect(Object.isFrozen(output)).toBe(true);
    expect(Object.isFrozen(output?.reservation)).toBe(true);
    expect(Object.isFrozen(output?.lifecycle)).toBe(true);
  });

  it("returns null when reservation result is unsuccessful", () => {
    const mapper = new ReservationPresentationMapper();
    const output = mapper.map(createReservationResult({ successful: false, reservation: null }));

    expect(output).toBeNull();
  });
});

describe("ReservationViewModelProvider", () => {
  it("creates UI-ready reservation view models with defaults", () => {
    const mapper = new ReservationPresentationMapper();
    const output = mapper.map(createReservationResult());

    if (!output) {
      throw new Error("Expected presentation output");
    }

    const provider = new ReservationViewModelProvider(mapper);
    const viewModel = provider.provideViewModel(output.reservation, output.lifecycle);

    expect(viewModel.id).toBe("RES-010101-PRS1");
    expect(viewModel.title).toBe("Cape Explorer Signature");
    expect(viewModel.statusBadgeStyle).toBe("warning");
    expect(viewModel.travellers).toBe("Ari Jacobs +1");
    expect(viewModel.nextAction.label).toBe("Settle outstanding balance");
    expect(viewModel.nextAction.style).toBe("primary");
    expect(Object.isFrozen(viewModel)).toBe(true);
    expect(Object.isFrozen(viewModel.payment)).toBe(true);
    expect(Object.isFrozen(viewModel.nextAction)).toBe(true);
  });

  it("maps reservation results directly to reservation view models", () => {
    const provider = new ReservationViewModelProvider();
    const viewModel = provider.mapReservationResultToViewModel(createReservationResult());

    expect(viewModel?.subtitle).toBe("Cape Peninsula");
    expect(viewModel?.timelineHeadline).toContain("QUOTED");
  });

  it("returns null when no reservation presentation output exists", () => {
    const provider = new ReservationViewModelProvider();
    const viewModel = provider.mapReservationResultToViewModel(
      createReservationResult({ successful: false, reservation: null }),
    );

    expect(viewModel).toBeNull();
  });
});

import { Reservation, ReservationStatus } from "@application/reservations/aggregate";
import { ReservationTimelineMilestone } from "@application/reservations/models";
import {
  CommercialIntegrityValidator,
  ReservationQueryValidator,
  ReservationSnapshotValidator,
  ReservationValidationPipeline,
  ReservationValidationErrorCode,
} from "@application/reservations/validation";

function createReservation() {
  return Reservation.create({
    identity: { id: "reservation-001" },
    status: ReservationStatus.CONFIRMED,
    journeySnapshot: {
      snapshotId: "journey-snap-001",
      capturedAt: new Date("2026-08-07T08:00:00.000Z"),
      version: "1.0.0",
      journeyId: "journey-1001",
      title: "Cape Winelands Signature",
      destination: "Cape Winelands",
      duration: "4 days / 3 nights",
      accommodationSummary: "Luxury retreat",
      experienceSummary: "Private tastings",
    },
    travellerSnapshots: [
      {
        snapshotId: "traveller-snap-001",
        capturedAt: new Date("2026-08-07T08:00:00.000Z"),
        version: "1.0.0",
        travellerId: "traveller-001",
        fullName: "Ari Jacobs",
      },
    ],
    accommodationSnapshots: [],
    pricingSnapshot: {
      snapshotId: "pricing-snap-001",
      capturedAt: new Date("2026-08-07T08:00:00.000Z"),
      version: "1.0.0",
      currency: "ZAR",
      totalPrice: 46000,
      taxes: 6000,
      discounts: 1000,
      fees: 500,
    },
    paymentSnapshot: {
      snapshotId: "payment-snap-001",
      capturedAt: new Date("2026-08-07T08:00:00.000Z"),
      version: "1.0.0",
      paymentStatus: "PENDING",
      amountReceived: 10000,
      balanceOutstanding: 36000,
    },
    supplierReferences: [
      {
        snapshotId: "supplier-snap-001",
        capturedAt: new Date("2026-08-07T08:00:00.000Z"),
        version: "1.0.0",
        providerId: "hotelbeds",
        supplierBookingReference: "hb-7788",
      },
    ],
    timeline: [
      {
        snapshotId: "timeline-snap-001",
        capturedAt: new Date("2026-08-07T08:00:00.000Z"),
        version: "1.0.0",
        milestone: ReservationTimelineMilestone.CONFIRMED,
        occurredAt: new Date("2026-08-07T08:00:00.000Z"),
      },
    ],
    metadata: {
      createdAt: new Date("2026-08-07T08:00:00.000Z"),
      updatedAt: new Date("2026-08-07T08:00:00.000Z"),
      version: "1.0.0",
    },
  });
}

describe("Reservation validation pipeline", () => {
  it("validates query, snapshot and commercial integrity in order", () => {
    const calls: string[] = [];
    const pipeline = new ReservationValidationPipeline({
      queryValidator: {
        validate: (query) => {
          calls.push(`query:${query!.requestId}`);
          return {
            valid: true,
            errors: [],
            warnings: [],
            integrityFindings: [],
            metadata: { validatedAt: new Date(), version: "1.0.0", source: "query" },
          };
        },
      } as ReservationQueryValidator,
      snapshotValidator: {
        validate: () => {
          calls.push("snapshot");
          return {
            valid: true,
            errors: [],
            warnings: [],
            integrityFindings: [],
            metadata: { validatedAt: new Date(), version: "1.0.0", source: "snapshot" },
          };
        },
      } as ReservationSnapshotValidator,
      integrityValidator: {
        validate: () => {
          calls.push("integrity");
          return {
            valid: true,
            errors: [],
            warnings: [],
            integrityFindings: [],
            metadata: { validatedAt: new Date(), version: "1.0.0", source: "integrity" },
          };
        },
      } as CommercialIntegrityValidator,
    });

    const result = pipeline.execute({
      query: {
        requestId: "req-001",
        journeyId: "journey-1001",
        checkInDate: new Date("2026-08-10T00:00:00.000Z"),
        checkOutDate: new Date("2026-08-14T00:00:00.000Z"),
        travellers: [{ travellerId: "traveller-001", fullName: "Ari Jacobs" }],
      },
      snapshots: {
        journeySnapshot: createReservation().journeySnapshot,
        travellerSnapshots: createReservation().travellerSnapshots,
        pricingSnapshot: createReservation().pricingSnapshot,
        paymentSnapshot: createReservation().paymentSnapshot,
        metadata: createReservation().metadata,
      },
      reservation: createReservation(),
    });

    expect(calls).toEqual(["query:req-001", "snapshot", "integrity"]);
    expect(result.valid).toBe(true);
  });

  it("returns query validation failures without executing later validators", () => {
    const pipeline = new ReservationValidationPipeline({
      queryValidator: {
        validate: () => ({
          valid: false,
          errors: [{ code: ReservationValidationErrorCode.INVALID_STRUCTURE, message: "bad query" }],
          warnings: [],
          integrityFindings: [],
          metadata: { validatedAt: new Date(), version: "1.0.0", source: "query" },
        }),
      } as ReservationQueryValidator,
      snapshotValidator: {
        validate: () => {
          throw new Error("should not run");
        },
      } as ReservationSnapshotValidator,
      integrityValidator: {
        validate: () => {
          throw new Error("should not run");
        },
      } as CommercialIntegrityValidator,
    });

    const result = pipeline.execute({
      query: {
        requestId: "",
        journeyId: "journey-1001",
        checkInDate: new Date("2026-08-10T00:00:00.000Z"),
        checkOutDate: new Date("2026-08-14T00:00:00.000Z"),
        travellers: [],
      },
      snapshots: {},
    });

    expect(result.valid).toBe(false);
    expect(result.errors[0]?.code).toBe(ReservationValidationErrorCode.INVALID_STRUCTURE);
  });

  it("validates query, snapshot and commercial rules with concrete validators", () => {
    const pipeline = new ReservationValidationPipeline({
      queryValidator: new ReservationQueryValidator(),
      snapshotValidator: new ReservationSnapshotValidator(),
      integrityValidator: new CommercialIntegrityValidator(),
    });

    const result = pipeline.execute({
      query: {
        requestId: "req-002",
        journeyId: "journey-1001",
        checkInDate: new Date("2026-08-10T00:00:00.000Z"),
        checkOutDate: new Date("2026-08-14T00:00:00.000Z"),
        travellers: [{ travellerId: "traveller-001", fullName: "Ari Jacobs" }],
      },
      snapshots: {
        journeySnapshot: createReservation().journeySnapshot,
        travellerSnapshots: createReservation().travellerSnapshots,
        pricingSnapshot: createReservation().pricingSnapshot,
        paymentSnapshot: createReservation().paymentSnapshot,
        metadata: createReservation().metadata,
      },
      reservation: createReservation(),
    });

    expect(result.valid).toBe(true);
    expect(result.metadata.source).toBe("ReservationValidationPipeline");
  });
});

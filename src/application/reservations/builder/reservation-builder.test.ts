import { ReservationStatus } from "@application/reservations/aggregate";
import { ReservationTimelineMilestone } from "@application/reservations/models";
import {
  createReservationPolicyResult,
  ReservationPolicyOutcome,
  ReservationPolicyPriority,
  ReservationPolicyResult,
} from "@application/reservations/policies";
import {
  ReservationBuilder,
  ReservationBuilderContext,
  ReservationAggregateValidator,
} from "@application/reservations/builder";

function createPolicyResult(overrides: Partial<ReservationPolicyResult> = {}): ReservationPolicyResult {
  return createReservationPolicyResult({
    permitted: true,
    outcome: ReservationPolicyOutcome.ALLOW,
    priority: ReservationPolicyPriority.NORMAL,
    warnings: [],
    errors: [],
    observations: [],
    metadata: {
      evaluatedAt: new Date("2026-08-07T09:00:00.000Z"),
      version: "1.0.0",
      source: "test",
    },
    ...overrides,
  });
}

function createContext(policyResult: ReservationPolicyResult = createPolicyResult()): ReservationBuilderContext {
  return Object.freeze({
    validatedRequest: {
      requestId: "reservation-request-001",
      customerId: "customer-001",
      journeyId: "journey-1001",
      checkInDate: new Date("2026-08-10T00:00:00.000Z"),
      checkOutDate: new Date("2026-08-14T00:00:00.000Z"),
      travellers: [
        {
          travellerId: "traveller-001",
          fullName: "Ari Jacobs",
        },
      ],
    },
    reservationNumber: "RES-123456-B001",
    snapshots: {
      journeySnapshot: {
        snapshotId: "journey-snap-001",
        capturedAt: new Date("2026-08-07T09:00:00.000Z"),
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
          capturedAt: new Date("2026-08-07T09:00:00.000Z"),
          version: "1.0.0",
          travellerId: "traveller-001",
          fullName: "Ari Jacobs",
        },
      ],
      pricingSnapshot: {
        snapshotId: "pricing-snap-001",
        capturedAt: new Date("2026-08-07T09:00:00.000Z"),
        version: "1.0.0",
        currency: "ZAR",
        totalPrice: 46000,
        taxes: 6000,
        discounts: 1000,
        fees: 500,
      },
      paymentSnapshot: {
        snapshotId: "payment-snap-001",
        capturedAt: new Date("2026-08-07T09:00:00.000Z"),
        version: "1.0.0",
        paymentStatus: "PENDING",
        amountReceived: 10000,
        balanceOutstanding: 36000,
      },
      supplierReferences: [
        {
          snapshotId: "supplier-snap-001",
          capturedAt: new Date("2026-08-07T09:00:00.000Z"),
          version: "1.0.0",
          providerId: "hotelbeds",
          supplierBookingReference: "hb-7788",
        },
      ],
      metadata: {
        createdAt: new Date("2026-08-07T09:00:00.000Z"),
        updatedAt: new Date("2026-08-07T09:00:00.000Z"),
        version: "1.0.0",
      },
    },
    approvedPolicyResult: policyResult,
    metadata: {
      createdAt: new Date("2026-08-07T09:00:00.000Z"),
      updatedAt: new Date("2026-08-07T09:00:00.000Z"),
      version: "1.0.0",
    },
    timelineSeed: Object.freeze([
      Object.freeze({
        snapshotId: "timeline-snap-001",
        capturedAt: new Date("2026-08-07T09:00:00.000Z"),
        version: "1.0.0",
        milestone: ReservationTimelineMilestone.CREATED,
        occurredAt: new Date("2026-08-07T09:00:00.000Z"),
      }),
    ]),
  });
}

describe("ReservationBuilder", () => {
  it("constructs a reservation aggregate from validated context", () => {
    const validatorCalls: string[] = [];
    const builder = new ReservationBuilder({
      validate: (reservation) => {
        validatorCalls.push(reservation.identity.id);
        return {
          valid: true,
          errors: [],
          warnings: [],
        };
      },
    } as ReservationAggregateValidator);

    const result = builder.build(createContext());

    expect(result.successful).toBe(true);
    expect(result.reservation?.identity.id).toBe("reservation-request-001");
    expect(result.reservation?.reservationNumber).toBe("RES-123456-B001");
    expect(result.reservation?.status).toBe(ReservationStatus.CREATED);
    expect(result.reservation?.timeline[0]?.milestone).toBe(ReservationTimelineMilestone.CREATED);
    expect(validatorCalls).toEqual(["reservation-request-001"]);
  });

  it("returns a failed build when policy denies construction", () => {
    const builder = new ReservationBuilder({
      validate: () => ({
        valid: true,
        errors: [],
        warnings: [],
      }),
    } as ReservationAggregateValidator);

    const result = builder.build(
      createContext(
        createPolicyResult({
          permitted: false,
          outcome: ReservationPolicyOutcome.DENY,
          priority: ReservationPolicyPriority.CRITICAL,
          errors: ["policy denied"],
        }),
      ),
    );

    expect(result.successful).toBe(false);
    expect(result.errors).toEqual(["policy denied"]);
    expect(result.reservation).toBeNull();
  });

  it("returns a failed build when aggregate validation fails", () => {
    const builder = new ReservationBuilder({
      validate: () => ({
        valid: false,
        errors: ["aggregate invalid"],
        warnings: ["aggregate warning"],
      }),
    } as ReservationAggregateValidator);

    const result = builder.build(createContext());

    expect(result.successful).toBe(false);
    expect(result.errors).toEqual(["aggregate invalid"]);
    expect(result.warnings).toEqual(["aggregate warning"]);
  });

  it("returns immutable build results", () => {
    const builder = new ReservationBuilder({
      validate: () => ({
        valid: true,
        errors: [],
        warnings: [],
      }),
    } as ReservationAggregateValidator);

    const result = builder.build(createContext());

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.errors)).toBe(true);
    expect(Object.isFrozen(result.warnings)).toBe(true);
    expect(Object.isFrozen(result.metadata)).toBe(true);
  });
});

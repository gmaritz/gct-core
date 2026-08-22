import { Reservation, ReservationStatus } from "@application/reservations/aggregate";
import { ReservationValidationResult, createReservationValidationResult } from "@application/reservations/validation";
import { ReservationTimelineMilestone } from "@application/reservations/models";
import {
  createReservationPolicyResult,
  ReservationAmendmentPolicy,
  ReservationCancellationPolicy,
  ReservationCommercialPolicy,
  ReservationEligibilityPolicy,
  ReservationPaymentPolicy,
  ReservationPolicy,
  ReservationPolicyContext,
  ReservationPolicyOutcome,
  ReservationPolicyPipeline,
  ReservationPolicyPriority,
  ReservationPolicyRegistry,
  ReservationPolicyResult,
  ReservationSupplierPolicy,
} from "@application/reservations/policies";

function createReservation(): Reservation {
  return Reservation.create({
    identity: { id: "reservation-001" },
    reservationNumber: "RES-000001-POL1",
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

function createContext(validationResult: ReservationValidationResult = createReservationValidationResult({
  metadata: {
    validatedAt: new Date("2026-08-07T08:00:00.000Z"),
    version: "1.0.0",
    source: "test",
  },
})): ReservationPolicyContext {
  return Object.freeze({
    validationResult,
    snapshots: {
      journeySnapshot: createReservation().journeySnapshot,
      travellerSnapshots: createReservation().travellerSnapshots,
      pricingSnapshot: createReservation().pricingSnapshot,
      paymentSnapshot: createReservation().paymentSnapshot,
      metadata: createReservation().metadata,
    },
    reservation: createReservation(),
  });
}

function createPolicyResult(
  outcome: ReservationPolicyOutcome,
  priority: ReservationPolicyPriority,
  messages: ReadonlyArray<string>,
): ReservationPolicyResult {
  return createReservationPolicyResult({
    permitted: outcome !== ReservationPolicyOutcome.DENY,
    outcome,
    priority,
    warnings: outcome === ReservationPolicyOutcome.WARNING ? messages : [],
    errors: outcome === ReservationPolicyOutcome.DENY ? messages : [],
    observations: outcome === ReservationPolicyOutcome.IGNORE ? messages : [],
    metadata: {
      evaluatedAt: new Date("2026-08-07T08:00:00.000Z"),
      version: "1.0.0",
      source: "test",
    },
  });
}

describe("ReservationPolicyRegistry", () => {
  it("registers and resolves policies", () => {
    const registry = new ReservationPolicyRegistry();
    const policy: ReservationPolicy<ReservationPolicyContext, ReservationPolicyResult> = {
      evaluate: () => createPolicyResult(ReservationPolicyOutcome.ALLOW, ReservationPolicyPriority.NORMAL, ["ok"]),
    };

    registry.register("eligibility", policy, ReservationPolicyPriority.HIGH);

    const resolved = registry.resolve("eligibility");

    expect(resolved).toBeDefined();
    expect(resolved?.name).toBe("eligibility");
    expect(resolved?.priority).toBe(ReservationPolicyPriority.HIGH);
    expect(resolved?.policy).toBe(policy);
  });

  it("rejects duplicate policy registration", () => {
    const registry = new ReservationPolicyRegistry();
    const policy: ReservationPolicy<ReservationPolicyContext, ReservationPolicyResult> = {
      evaluate: () => createPolicyResult(ReservationPolicyOutcome.ALLOW, ReservationPolicyPriority.NORMAL, ["ok"]),
    };

    registry.register("eligibility", policy, ReservationPolicyPriority.NORMAL);

    expect(() => registry.register("eligibility", policy, ReservationPolicyPriority.HIGH)).toThrow(
      "Reservation policy 'eligibility' is already registered.",
    );
  });

  it("unregisters policies", () => {
    const registry = new ReservationPolicyRegistry();
    const policy: ReservationPolicy<ReservationPolicyContext, ReservationPolicyResult> = {
      evaluate: () => createPolicyResult(ReservationPolicyOutcome.ALLOW, ReservationPolicyPriority.NORMAL, ["ok"]),
    };

    registry.register("payment", policy, ReservationPolicyPriority.NORMAL);

    expect(registry.unregister("payment")).toBe(true);
    expect(registry.resolve("payment")).toBeUndefined();
    expect(registry.unregister("payment")).toBe(false);
  });

  it("resolves all policies in deterministic priority order with immutable output", () => {
    const registry = new ReservationPolicyRegistry();

    registry.register("normal", { evaluate: () => createPolicyResult(ReservationPolicyOutcome.ALLOW, ReservationPolicyPriority.NORMAL, ["normal"]) }, ReservationPolicyPriority.NORMAL);
    registry.register("critical", { evaluate: () => createPolicyResult(ReservationPolicyOutcome.ALLOW, ReservationPolicyPriority.CRITICAL, ["critical"]) }, ReservationPolicyPriority.CRITICAL);
    registry.register("high", { evaluate: () => createPolicyResult(ReservationPolicyOutcome.ALLOW, ReservationPolicyPriority.HIGH, ["high"]) }, ReservationPolicyPriority.HIGH);
    registry.register("low", { evaluate: () => createPolicyResult(ReservationPolicyOutcome.ALLOW, ReservationPolicyPriority.LOW, ["low"]) }, ReservationPolicyPriority.LOW);

    const registrations = registry.resolveAll();

    expect(registrations.map((registration) => registration.name)).toEqual([
      "critical",
      "high",
      "normal",
      "low",
    ]);
    expect(Object.isFrozen(registrations)).toBe(true);
    expect(Object.isFrozen(registrations[0])).toBe(true);
  });
});

describe("ReservationPolicyPipeline", () => {
  it("executes policies in priority order", () => {
    const registry = new ReservationPolicyRegistry();
    const events: string[] = [];

    registry.register(
      "normal",
      {
        evaluate: () => {
          events.push("normal");
          return createPolicyResult(ReservationPolicyOutcome.ALLOW, ReservationPolicyPriority.NORMAL, ["normal"]);
        },
      },
      ReservationPolicyPriority.NORMAL,
    );

    registry.register(
      "critical",
      {
        evaluate: () => {
          events.push("critical");
          return createPolicyResult(ReservationPolicyOutcome.ALLOW, ReservationPolicyPriority.CRITICAL, ["critical"]);
        },
      },
      ReservationPolicyPriority.CRITICAL,
    );

    registry.register(
      "high",
      {
        evaluate: () => {
          events.push("high");
          return createPolicyResult(ReservationPolicyOutcome.ALLOW, ReservationPolicyPriority.HIGH, ["high"]);
        },
      },
      ReservationPolicyPriority.HIGH,
    );

    const pipeline = new ReservationPolicyPipeline(registry);

    const results = pipeline.evaluate(createContext());

    expect(events).toEqual(["critical", "high", "normal"]);
    expect(results.permitted).toBe(true);
    expect(results.outcome).toBe(ReservationPolicyOutcome.ALLOW);
  });

  it("short-circuits on critical denial", () => {
    const registry = new ReservationPolicyRegistry();
    const events: string[] = [];

    registry.register(
      "critical-deny",
      {
        evaluate: () => {
          events.push("critical-deny");
          return createPolicyResult(ReservationPolicyOutcome.DENY, ReservationPolicyPriority.CRITICAL, ["stop"]);
        },
      },
      ReservationPolicyPriority.CRITICAL,
    );

    registry.register(
      "high",
      {
        evaluate: () => {
          events.push("high");
          return createPolicyResult(ReservationPolicyOutcome.ALLOW, ReservationPolicyPriority.HIGH, ["unreached"]);
        },
      },
      ReservationPolicyPriority.HIGH,
    );

    const pipeline = new ReservationPolicyPipeline(registry);

    const results = pipeline.evaluate(createContext());

    expect(events).toEqual(["critical-deny"]);
    expect(results.permitted).toBe(false);
    expect(results.outcome).toBe(ReservationPolicyOutcome.DENY);
    expect(results.errors).toEqual(["stop"]);
  });

  it("returns immutable pipeline results", () => {
    const registry = new ReservationPolicyRegistry();

    registry.register(
      "normal",
      {
        evaluate: () => ({
          permitted: true,
          outcome: ReservationPolicyOutcome.WARNING,
          priority: ReservationPolicyPriority.NORMAL,
          errors: [],
          warnings: ["watch"],
          observations: ["note"],
          metadata: {
            evaluatedAt: new Date("2026-08-07T08:00:00.000Z"),
            version: "1.0.0",
            source: "test",
          },
        }),
      },
      ReservationPolicyPriority.NORMAL,
    );

    const pipeline = new ReservationPolicyPipeline(registry);
    const results = pipeline.evaluate(createContext());

    expect(Object.isFrozen(results.errors)).toBe(true);
    expect(Object.isFrozen(results.warnings)).toBe(true);
    expect(Object.isFrozen(results.observations)).toBe(true);
    expect(Object.isFrozen(results.metadata)).toBe(true);
  });
});

describe("Reservation policy contracts", () => {
  it("exposes initial reservation policy contracts with compile-safe signatures", () => {
    const eligibility: ReservationEligibilityPolicy = {
      evaluate: (context) => createPolicyResult(ReservationPolicyOutcome.ALLOW, ReservationPolicyPriority.HIGH, [context.reservation?.identity.id ?? ""]),
    };
    const commercial: ReservationCommercialPolicy = {
      evaluate: () => createPolicyResult(ReservationPolicyOutcome.ALLOW, ReservationPolicyPriority.NORMAL, ["commercial"]),
    };
    const supplier: ReservationSupplierPolicy = {
      evaluate: () => createPolicyResult(ReservationPolicyOutcome.IGNORE, ReservationPolicyPriority.LOW, ["supplier"]),
    };
    const payment: ReservationPaymentPolicy = {
      evaluate: () => createPolicyResult(ReservationPolicyOutcome.WARNING, ReservationPolicyPriority.NORMAL, ["payment"]),
    };
    const amendment: ReservationAmendmentPolicy = {
      evaluate: () => createPolicyResult(ReservationPolicyOutcome.IGNORE, ReservationPolicyPriority.LOW, ["amendment"]),
    };
    const cancellation: ReservationCancellationPolicy = {
      evaluate: () => createPolicyResult(ReservationPolicyOutcome.IGNORE, ReservationPolicyPriority.LOW, ["cancellation"]),
    };

    expect(typeof eligibility.evaluate).toBe("function");
    expect(typeof commercial.evaluate).toBe("function");
    expect(typeof supplier.evaluate).toBe("function");
    expect(typeof payment.evaluate).toBe("function");
    expect(typeof amendment.evaluate).toBe("function");
    expect(typeof cancellation.evaluate).toBe("function");
  });
});

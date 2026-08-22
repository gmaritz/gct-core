import { Reservation, ReservationStatus } from "@application/reservations/aggregate";
import { ReservationBuildResult, createReservationBuildResult, ReservationBuilder } from "@application/reservations/builder";
import { ReservationTimelineMilestone } from "@application/reservations/models";
import { ReservationRepository } from "@application/reservations/repository";
import {
  createReservationPolicyResult,
  ReservationPolicyOutcome,
  ReservationPolicyPipeline,
  ReservationPolicyPriority,
  ReservationPolicyResult,
} from "@application/reservations/policies";
import {
  ReservationResult,
  ReservationService,
  ReservationServiceRequest,
  createReservationServiceContext,
  withBuilderResult,
  withPolicyResult,
  withValidationResult,
} from "@application/reservations/service";
import {
  createReservationValidationResult,
  ReservationValidationErrorCode,
  ReservationValidationPipeline,
  ReservationValidationResult,
} from "@application/reservations/validation";

function createReservation(): Reservation {
  return Reservation.create({
    identity: { id: "reservation-001" },
    reservationNumber: "RES-000001-SVC1",
    status: ReservationStatus.CREATED,
    journeySnapshot: {
      snapshotId: "journey-snap-001",
      capturedAt: new Date("2026-08-07T10:00:00.000Z"),
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
        capturedAt: new Date("2026-08-07T10:00:00.000Z"),
        version: "1.0.0",
        travellerId: "traveller-001",
        fullName: "Ari Jacobs",
      },
    ],
    pricingSnapshot: {
      snapshotId: "pricing-snap-001",
      capturedAt: new Date("2026-08-07T10:00:00.000Z"),
      version: "1.0.0",
      currency: "ZAR",
      totalPrice: 46000,
      taxes: 6000,
      discounts: 1000,
      fees: 500,
    },
    paymentSnapshot: {
      snapshotId: "payment-snap-001",
      capturedAt: new Date("2026-08-07T10:00:00.000Z"),
      version: "1.0.0",
      paymentStatus: "PENDING",
      amountReceived: 10000,
      balanceOutstanding: 36000,
    },
    timeline: [
      {
        snapshotId: "timeline-snap-001",
        capturedAt: new Date("2026-08-07T10:00:00.000Z"),
        version: "1.0.0",
        milestone: ReservationTimelineMilestone.CREATED,
        occurredAt: new Date("2026-08-07T10:00:00.000Z"),
      },
    ],
    metadata: {
      createdAt: new Date("2026-08-07T10:00:00.000Z"),
      updatedAt: new Date("2026-08-07T10:00:00.000Z"),
      version: "1.0.0",
    },
  });
}

function createRequest(): ReservationServiceRequest {
  return Object.freeze({
    query: {
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
    snapshots: {
      journeySnapshot: createReservation().journeySnapshot,
      travellerSnapshots: createReservation().travellerSnapshots,
      accommodationSnapshots: createReservation().accommodationSnapshots,
      pricingSnapshot: createReservation().pricingSnapshot,
      paymentSnapshot: createReservation().paymentSnapshot,
      metadata: createReservation().metadata,
    },
    metadata: {
      createdAt: new Date("2026-08-07T10:00:00.000Z"),
      updatedAt: new Date("2026-08-07T10:00:00.000Z"),
      version: "1.0.0",
    },
    timelineSeed: Object.freeze([
      Object.freeze({
        snapshotId: "timeline-snap-001",
        capturedAt: new Date("2026-08-07T10:00:00.000Z"),
        version: "1.0.0",
        milestone: ReservationTimelineMilestone.CREATED,
        occurredAt: new Date("2026-08-07T10:00:00.000Z"),
      }),
    ]),
  });
}

function createValidation(valid: boolean): ReservationValidationResult {
  return createReservationValidationResult({
    errors: valid
      ? []
      : [{ code: ReservationValidationErrorCode.INVALID_QUERY, message: "invalid request" }],
    metadata: {
      validatedAt: new Date("2026-08-07T10:00:00.000Z"),
      version: "1.0.0",
      source: "test",
    },
  });
}

function createPolicy(permitted: boolean): ReservationPolicyResult {
  return createReservationPolicyResult({
    permitted,
    outcome: permitted ? ReservationPolicyOutcome.ALLOW : ReservationPolicyOutcome.DENY,
    priority: permitted ? ReservationPolicyPriority.NORMAL : ReservationPolicyPriority.CRITICAL,
    errors: permitted ? [] : ["policy denied"],
    warnings: [],
    observations: [],
    metadata: {
      evaluatedAt: new Date("2026-08-07T10:00:00.000Z"),
      version: "1.0.0",
      source: "test",
    },
  });
}

function createBuildResult(successful: boolean): ReservationBuildResult {
  return createReservationBuildResult({
    successful,
    reservation: successful ? createReservation() : null,
    errors: successful ? [] : ["build failed"],
    warnings: successful ? ["build warning"] : ["build warning"],
    metadata: {
      builtAt: new Date("2026-08-07T10:00:00.000Z"),
      version: "1.0.0",
      source: "test",
    },
  });
}

describe("ReservationService", () => {
  it("orchestrates validation, policy and builder in order", async () => {
    const events: string[] = [];
    let persisted = false;

    const service = new ReservationService(
      {
        execute: () => {
          events.push("validation");
          return createValidation(true);
        },
      } as unknown as ReservationValidationPipeline,
      {
        evaluate: () => {
          events.push("policy");
          return createPolicy(true);
        },
      } as unknown as ReservationPolicyPipeline,
      {
        build: () => {
          events.push("builder");
          return createBuildResult(true);
        },
      } as unknown as ReservationBuilder,
      {
        save: async () => {
          persisted = true;
        },
        findById: async () => null,
        findByReservationNumber: async () => null,
        findByTravellerId: async () => [],
        findByJourneyId: async () => [],
        delete: async () => undefined,
      } as ReservationRepository,
    );

    const result = await service.execute(createRequest());

    expect(events).toEqual(["validation", "policy", "builder"]);
    expect(result.successful).toBe(true);
    expect(persisted).toBe(true);
  });

  it("stops when validation fails", async () => {
    const events: string[] = [];

    const service = new ReservationService(
      {
        execute: () => {
          events.push("validation");
          return createValidation(false);
        },
      } as unknown as ReservationValidationPipeline,
      {
        evaluate: () => {
          events.push("policy");
          return createPolicy(true);
        },
      } as unknown as ReservationPolicyPipeline,
      {
        build: () => {
          events.push("builder");
          return createBuildResult(true);
        },
      } as unknown as ReservationBuilder,
      {
        save: async () => undefined,
        findById: async () => null,
        findByReservationNumber: async () => null,
        findByTravellerId: async () => [],
        findByJourneyId: async () => [],
        delete: async () => undefined,
      } as ReservationRepository,
    );

    const result = await service.execute(createRequest());

    expect(events).toEqual(["validation"]);
    expect(result.successful).toBe(false);
    expect(result.errors).toEqual(["invalid request"]);
  });

  it("stops when policy denies reservation", async () => {
    const events: string[] = [];

    const service = new ReservationService(
      {
        execute: () => {
          events.push("validation");
          return createValidation(true);
        },
      } as unknown as ReservationValidationPipeline,
      {
        evaluate: () => {
          events.push("policy");
          return createPolicy(false);
        },
      } as unknown as ReservationPolicyPipeline,
      {
        build: () => {
          events.push("builder");
          return createBuildResult(true);
        },
      } as unknown as ReservationBuilder,
      {
        save: async () => undefined,
        findById: async () => null,
        findByReservationNumber: async () => null,
        findByTravellerId: async () => [],
        findByJourneyId: async () => [],
        delete: async () => undefined,
      } as ReservationRepository,
    );

    const result = await service.execute(createRequest());

    expect(events).toEqual(["validation", "policy"]);
    expect(result.successful).toBe(false);
    expect(result.errors).toEqual(["policy denied"]);
  });

  it("returns successful result when builder succeeds", async () => {
    let savedContextCustomerId = "";
    const service = new ReservationService(
      {
        execute: () => createValidation(true),
      } as unknown as ReservationValidationPipeline,
      {
        evaluate: () => createPolicy(true),
      } as unknown as ReservationPolicyPipeline,
      {
        build: () => createBuildResult(true),
      } as unknown as ReservationBuilder,
      {
        save: async (_reservation, context) => {
          savedContextCustomerId = context.customerId;
        },
        findById: async () => null,
        findByReservationNumber: async () => null,
        findByTravellerId: async () => [],
        findByJourneyId: async () => [],
        delete: async () => undefined,
      } as ReservationRepository,
    );

    const result: ReservationResult = await service.execute(createRequest());

    expect(result.successful).toBe(true);
    expect(result.reservation?.identity.id).toBe("reservation-001");
    expect(savedContextCustomerId).toBe("customer-001");
  });
});

describe("ReservationServiceContext", () => {
  it("constructs immutable context and supports stage enrichment", () => {
    const request = createRequest();
    const context = createReservationServiceContext(request);
    const withValidation = withValidationResult(context, createValidation(true));
    const withPolicy = withPolicyResult(withValidation, createPolicy(true));
    const withBuild = withBuilderResult(withPolicy, createBuildResult(true));

    expect(Object.isFrozen(context)).toBe(true);
    expect(Object.isFrozen(context.metadata)).toBe(true);
    expect(withValidation.validationResult?.valid).toBe(true);
    expect(withPolicy.policyResult?.permitted).toBe(true);
    expect(withBuild.builderResult?.successful).toBe(true);
    expect(withBuild.reservation?.identity.id).toBe("reservation-001");
  });
});

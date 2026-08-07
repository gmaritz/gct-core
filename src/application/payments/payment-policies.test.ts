import {
  createPaymentPolicyContext,
  createPaymentPolicyResult,
  PaymentPolicyContext,
  PaymentPolicyOutcome,
  PaymentPolicyPipeline,
  PaymentPolicyPriority,
  PaymentPolicyRegistry,
  PaymentPolicyResult,
  PaymentRequiredAction,
} from "@application/payments/policies";
import {
  AuthorizationPolicy,
  CurrencyPolicy,
  PaymentEligibilityPolicy,
  PaymentMethodPolicy,
  RefundPolicy,
  RiskPolicy,
  SettlementPolicy,
} from "@application/payments/policies/contracts";
import {
  PaymentMethod,
  PaymentStatus,
} from "@application/payments/models";
import { PaymentPolicy } from "@application/payments/policies/contracts";

function createContext(): PaymentPolicyContext {
  return createPaymentPolicyContext({
    reservationSnapshot: {
      snapshotId: "reservation-snap-4001",
      capturedAt: new Date("2026-08-07T12:00:00.000Z"),
      version: "1.0.0",
      reservationId: "reservation-4001",
      reservationReference: "RES-4001",
    },
    pricingSnapshot: {
      snapshotId: "pricing-snap-4001",
      capturedAt: new Date("2026-08-07T12:01:00.000Z"),
      version: "1.0.0",
      pricingId: "pricing-4001",
      subtotal: 15000,
      taxes: 2000,
      discounts: 500,
      fees: 100,
      total: 16600,
      currency: "ZAR",
    },
    paymentRequest: {
      reference: {
        paymentId: "payment-4001",
        reservationId: "reservation-4001",
      },
      reservationSnapshot: {
        snapshotId: "reservation-snap-4001",
        capturedAt: new Date("2026-08-07T12:00:00.000Z"),
        version: "1.0.0",
        reservationId: "reservation-4001",
        reservationReference: "RES-4001",
      },
      pricingSnapshot: {
        snapshotId: "pricing-snap-4001",
        capturedAt: new Date("2026-08-07T12:01:00.000Z"),
        version: "1.0.0",
        pricingId: "pricing-4001",
        subtotal: 15000,
        taxes: 2000,
        discounts: 500,
        fees: 100,
        total: 16600,
        currency: "ZAR",
      },
      paymentAmount: 16600,
      currency: "ZAR",
      paymentMethod: PaymentMethod.CARD,
      status: PaymentStatus.CREATED,
      metadata: {
        createdAt: new Date("2026-08-07T12:00:00.000Z"),
        updatedAt: new Date("2026-08-07T12:00:00.000Z"),
        version: "1.0.0",
        source: "test",
      },
      reservationContext: {
        exists: true,
        status: "CONFIRMED",
        payable: true,
      },
      gatewayContext: {
        providerReference: {
          providerIdentifier: "gateway-a",
          reference: "GW-4001",
        },
        correlationId: "corr-4001",
        requestId: "request-4001",
        paymentContextId: "context-4001",
      },
    },
    paymentMethod: PaymentMethod.CARD,
    paymentMetadata: {
      createdAt: new Date("2026-08-07T12:00:00.000Z"),
      updatedAt: new Date("2026-08-07T12:00:00.000Z"),
      version: "1.0.0",
      source: "test",
    },
  });
}

function createPolicyResult(
  policyName: string,
  outcome: PaymentPolicyOutcome,
  priority: PaymentPolicyPriority,
): PaymentPolicyResult {
  return createPaymentPolicyResult({
    policyName,
    outcome,
    priority,
    requiredActions: outcome === PaymentPolicyOutcome.REQUIRE_ACTION
      ? [PaymentRequiredAction.MANUAL_APPROVAL]
      : [],
    warnings: outcome === PaymentPolicyOutcome.REQUIRE_ACTION ? ["action required"] : [],
    metadata: {
      evaluatedAt: new Date("2026-08-07T12:30:00.000Z"),
      version: "1.0.0",
      source: "test",
    },
  });
}

describe("PaymentPolicyRegistry", () => {
  it("registers and resolves policies", () => {
    const registry = new PaymentPolicyRegistry();
    const policy: PaymentPolicy<PaymentPolicyContext, PaymentPolicyResult> = {
      evaluate: () => createPolicyResult("eligibility", PaymentPolicyOutcome.ALLOW, PaymentPolicyPriority.NORMAL),
    };

    registry.register("eligibility", policy, PaymentPolicyPriority.HIGH);

    const resolved = registry.resolve("eligibility");

    expect(resolved).toBeDefined();
    expect(resolved?.name).toBe("eligibility");
    expect(resolved?.priority).toBe(PaymentPolicyPriority.HIGH);
    expect(resolved?.policy).toBe(policy);
  });

  it("rejects duplicate policy registration", () => {
    const registry = new PaymentPolicyRegistry();
    const policy: PaymentPolicy<PaymentPolicyContext, PaymentPolicyResult> = {
      evaluate: () => createPolicyResult("method", PaymentPolicyOutcome.ALLOW, PaymentPolicyPriority.NORMAL),
    };

    registry.register("method", policy, PaymentPolicyPriority.NORMAL);

    expect(() => registry.register("method", policy, PaymentPolicyPriority.HIGH)).toThrow(
      "Payment policy 'method' is already registered.",
    );
  });

  it("unregisters policies", () => {
    const registry = new PaymentPolicyRegistry();
    const policy: PaymentPolicy<PaymentPolicyContext, PaymentPolicyResult> = {
      evaluate: () => createPolicyResult("risk", PaymentPolicyOutcome.ALLOW, PaymentPolicyPriority.LOW),
    };

    registry.register("risk", policy, PaymentPolicyPriority.LOW);

    expect(registry.unregister("risk")).toBe(true);
    expect(registry.resolve("risk")).toBeUndefined();
    expect(registry.unregister("risk")).toBe(false);
  });

  it("resolves all policies in deterministic order and immutable collection", () => {
    const registry = new PaymentPolicyRegistry();

    registry.register("normal", { evaluate: () => createPolicyResult("normal", PaymentPolicyOutcome.ALLOW, PaymentPolicyPriority.NORMAL) }, PaymentPolicyPriority.NORMAL);
    registry.register("critical", { evaluate: () => createPolicyResult("critical", PaymentPolicyOutcome.ALLOW, PaymentPolicyPriority.CRITICAL) }, PaymentPolicyPriority.CRITICAL);
    registry.register("high", { evaluate: () => createPolicyResult("high", PaymentPolicyOutcome.ALLOW, PaymentPolicyPriority.HIGH) }, PaymentPolicyPriority.HIGH);
    registry.register("low", { evaluate: () => createPolicyResult("low", PaymentPolicyOutcome.ALLOW, PaymentPolicyPriority.LOW) }, PaymentPolicyPriority.LOW);

    const registrations = registry.resolveAll();

    expect(registrations.map((registration) => registration.name)).toEqual(["critical", "high", "normal", "low"]);
    expect(Object.isFrozen(registrations)).toBe(true);
    expect(Object.isFrozen(registrations[0])).toBe(true);
  });
});

describe("PaymentPolicyPipeline", () => {
  it("executes in priority order and allows flow", () => {
    const registry = new PaymentPolicyRegistry();
    const events: string[] = [];

    registry.register(
      "normal",
      {
        evaluate: () => {
          events.push("normal");
          return createPolicyResult("normal", PaymentPolicyOutcome.ALLOW, PaymentPolicyPriority.NORMAL);
        },
      },
      PaymentPolicyPriority.NORMAL,
    );

    registry.register(
      "critical",
      {
        evaluate: () => {
          events.push("critical");
          return createPolicyResult("critical", PaymentPolicyOutcome.ALLOW, PaymentPolicyPriority.CRITICAL);
        },
      },
      PaymentPolicyPriority.CRITICAL,
    );

    registry.register(
      "high",
      {
        evaluate: () => {
          events.push("high");
          return createPolicyResult("high", PaymentPolicyOutcome.ALLOW, PaymentPolicyPriority.HIGH);
        },
      },
      PaymentPolicyPriority.HIGH,
    );

    const pipeline = new PaymentPolicyPipeline(registry);
    const result = pipeline.evaluate(createContext());

    expect(events).toEqual(["critical", "high", "normal"]);
    expect(result.permitted).toBe(true);
    expect(result.outcome).toBe(PaymentPolicyOutcome.ALLOW);
  });

  it("short-circuits on DENY", () => {
    const registry = new PaymentPolicyRegistry();
    const events: string[] = [];

    registry.register(
      "critical-deny",
      {
        evaluate: () => {
          events.push("critical-deny");
          return createPolicyResult("critical-deny", PaymentPolicyOutcome.DENY, PaymentPolicyPriority.CRITICAL);
        },
      },
      PaymentPolicyPriority.CRITICAL,
    );

    registry.register(
      "normal",
      {
        evaluate: () => {
          events.push("normal");
          return createPolicyResult("normal", PaymentPolicyOutcome.ALLOW, PaymentPolicyPriority.NORMAL);
        },
      },
      PaymentPolicyPriority.NORMAL,
    );

    const pipeline = new PaymentPolicyPipeline(registry);
    const result = pipeline.evaluate(createContext());

    expect(events).toEqual(["critical-deny"]);
    expect(result.permitted).toBe(false);
    expect(result.outcome).toBe(PaymentPolicyOutcome.DENY);
  });

  it("supports REQUIRE_ACTION flow and immutable results", () => {
    const registry = new PaymentPolicyRegistry();

    registry.register(
      "risk",
      {
        evaluate: () => createPolicyResult("risk", PaymentPolicyOutcome.REQUIRE_ACTION, PaymentPolicyPriority.HIGH),
      },
      PaymentPolicyPriority.HIGH,
    );

    const pipeline = new PaymentPolicyPipeline(registry);
    const result = pipeline.evaluate(createContext());

    expect(result.permitted).toBe(true);
    expect(result.outcome).toBe(PaymentPolicyOutcome.REQUIRE_ACTION);
    expect(result.requiredActions).toEqual([PaymentRequiredAction.MANUAL_APPROVAL]);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.requiredActions)).toBe(true);
    expect(Object.isFrozen(result.policyResults)).toBe(true);
    expect(Object.isFrozen(result.warnings)).toBe(true);
    expect(Object.isFrozen(result.metadata)).toBe(true);
  });
});

describe("Payment policy contracts", () => {
  it("exposes compile-safe policy family interfaces", () => {
    const eligibility: PaymentEligibilityPolicy = {
      evaluate: () => createPolicyResult("eligibility", PaymentPolicyOutcome.ALLOW, PaymentPolicyPriority.NORMAL),
    };
    const method: PaymentMethodPolicy = {
      evaluate: () => createPolicyResult("method", PaymentPolicyOutcome.ALLOW, PaymentPolicyPriority.NORMAL),
    };
    const currency: CurrencyPolicy = {
      evaluate: () => createPolicyResult("currency", PaymentPolicyOutcome.ALLOW, PaymentPolicyPriority.NORMAL),
    };
    const settlement: SettlementPolicy = {
      evaluate: () => createPolicyResult("settlement", PaymentPolicyOutcome.ALLOW, PaymentPolicyPriority.NORMAL),
    };
    const authorization: AuthorizationPolicy = {
      evaluate: () => createPolicyResult("authorization", PaymentPolicyOutcome.ALLOW, PaymentPolicyPriority.NORMAL),
    };
    const refund: RefundPolicy = {
      evaluate: () => createPolicyResult("refund", PaymentPolicyOutcome.ALLOW, PaymentPolicyPriority.NORMAL),
    };
    const risk: RiskPolicy = {
      evaluate: () => createPolicyResult("risk", PaymentPolicyOutcome.REQUIRE_ACTION, PaymentPolicyPriority.HIGH),
    };

    expect(typeof eligibility.evaluate).toBe("function");
    expect(typeof method.evaluate).toBe("function");
    expect(typeof currency.evaluate).toBe("function");
    expect(typeof settlement.evaluate).toBe("function");
    expect(typeof authorization.evaluate).toBe("function");
    expect(typeof refund.evaluate).toBe("function");
    expect(typeof risk.evaluate).toBe("function");
  });
});

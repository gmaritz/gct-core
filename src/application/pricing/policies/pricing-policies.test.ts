import {
  createMoney,
  createPricingBreakdown,
  createPricingLineItem,
  createPricingSummary,
  createPricingTotal,
  createTax,
  createTaxBreakdown,
  Currency,
  PricingValidationRequest,
  TaxType,
} from "@application/pricing";
import {
  CommissionPolicy,
  CorporatePricingPolicy,
  createPricingPolicyContext,
  createPricingPolicyResult,
  LoyaltyPricingPolicy,
  MarkupPolicy,
  PricingPolicy,
  PricingPolicyContext,
  PricingPolicyOutcome,
  PricingPolicyPipeline,
  PricingPolicyPriority,
  PricingPolicyRegistry,
  PricingPolicyResult,
  PromotionPolicy,
  SeasonalPricingPolicy,
} from "@application/pricing/policies";

function createRequest(): PricingValidationRequest {
  return {
    currency: Currency.ZAR,
    summary: createPricingSummary({
      productId: "journey-2001",
      productType: "JOURNEY",
      description: "Cape Town Signature",
    }),
    breakdown: createPricingBreakdown({
      lineItems: [
        createPricingLineItem({
          code: "BASE",
          label: "Base",
          unitAmount: createMoney({ amount: 22000, currency: Currency.ZAR }),
          totalAmount: createMoney({ amount: 44000, currency: Currency.ZAR }),
          quantity: 2,
        }),
      ],
    }),
    taxes: createTaxBreakdown({
      entries: [
        createTax({
          code: "VAT",
          type: TaxType.VAT,
          amount: createMoney({ amount: 4400, currency: Currency.ZAR }),
        }),
      ],
      total: createMoney({ amount: 4400, currency: Currency.ZAR }),
    }),
    fees: [],
    discounts: [],
    markups: [],
    commissions: [],
    promotions: [],
    totals: createPricingTotal({
      subtotal: createMoney({ amount: 44000, currency: Currency.ZAR }),
      taxTotal: createMoney({ amount: 4400, currency: Currency.ZAR }),
      feeTotal: createMoney({ amount: 0, currency: Currency.ZAR }),
      discountTotal: createMoney({ amount: 0, currency: Currency.ZAR }),
      markupTotal: createMoney({ amount: 0, currency: Currency.ZAR }),
      commissionTotal: createMoney({ amount: 0, currency: Currency.ZAR }),
      grandTotal: createMoney({ amount: 48400, currency: Currency.ZAR }),
    }),
  };
}

function createContext(): PricingPolicyContext {
  return createPricingPolicyContext({
    pricingRequest: createRequest(),
    journeySummary: {
      journeyId: "journey-2001",
      productType: "JOURNEY",
      destination: "Cape Town",
    },
    travellerInformation: {
      travellerCount: 2,
      residentCountry: "ZA",
    },
    commercialMetadata: {
      segment: "premium",
    },
    market: "ZA",
    salesChannel: "DIRECT",
    bookingDate: new Date("2026-08-07T00:00:00.000Z"),
  });
}

function createPolicyResult(
  policyName: string,
  outcome: PricingPolicyOutcome,
  priority: PricingPolicyPriority,
): PricingPolicyResult {
  return createPricingPolicyResult({
    policyName,
    outcome,
    priority,
    selectedStrategy: outcome === PricingPolicyOutcome.APPLY
      ? {
          id: `${policyName}-strategy`,
          type: policyName,
          profile: "default",
        }
      : undefined,
    warnings: outcome === PricingPolicyOutcome.WARNING ? ["watch"] : [],
    errors: outcome === PricingPolicyOutcome.DENY ? ["deny"] : [],
    metadata: {
      evaluatedAt: new Date("2026-08-07T00:00:00.000Z"),
      version: "1.0.0",
      source: "test",
    },
  });
}

describe("PricingPolicyRegistry", () => {
  it("registers and resolves policies", () => {
    const registry = new PricingPolicyRegistry();
    const policy: PricingPolicy<PricingPolicyContext, PricingPolicyResult> = {
      evaluate: () => createPolicyResult("promotion", PricingPolicyOutcome.APPLY, PricingPolicyPriority.NORMAL),
    };

    registry.register("promotion", policy, PricingPolicyPriority.HIGH);

    const resolved = registry.resolve("promotion");

    expect(resolved).toBeDefined();
    expect(resolved?.name).toBe("promotion");
    expect(resolved?.priority).toBe(PricingPolicyPriority.HIGH);
    expect(resolved?.policy).toBe(policy);
  });

  it("rejects duplicate policy registration", () => {
    const registry = new PricingPolicyRegistry();
    const policy: PricingPolicy<PricingPolicyContext, PricingPolicyResult> = {
      evaluate: () => createPolicyResult("corporate", PricingPolicyOutcome.APPLY, PricingPolicyPriority.NORMAL),
    };

    registry.register("corporate", policy, PricingPolicyPriority.NORMAL);

    expect(() => registry.register("corporate", policy, PricingPolicyPriority.HIGH)).toThrow(
      "Pricing policy 'corporate' is already registered.",
    );
  });

  it("unregisters policies", () => {
    const registry = new PricingPolicyRegistry();
    const policy: PricingPolicy<PricingPolicyContext, PricingPolicyResult> = {
      evaluate: () => createPolicyResult("seasonal", PricingPolicyOutcome.IGNORE, PricingPolicyPriority.LOW),
    };

    registry.register("seasonal", policy, PricingPolicyPriority.LOW);

    expect(registry.unregister("seasonal")).toBe(true);
    expect(registry.resolve("seasonal")).toBeUndefined();
    expect(registry.unregister("seasonal")).toBe(false);
  });

  it("resolves all policies in deterministic priority order and immutable collection", () => {
    const registry = new PricingPolicyRegistry();

    registry.register("normal", { evaluate: () => createPolicyResult("normal", PricingPolicyOutcome.APPLY, PricingPolicyPriority.NORMAL) }, PricingPolicyPriority.NORMAL);
    registry.register("critical", { evaluate: () => createPolicyResult("critical", PricingPolicyOutcome.APPLY, PricingPolicyPriority.CRITICAL) }, PricingPolicyPriority.CRITICAL);
    registry.register("high", { evaluate: () => createPolicyResult("high", PricingPolicyOutcome.APPLY, PricingPolicyPriority.HIGH) }, PricingPolicyPriority.HIGH);
    registry.register("low", { evaluate: () => createPolicyResult("low", PricingPolicyOutcome.APPLY, PricingPolicyPriority.LOW) }, PricingPolicyPriority.LOW);

    const registrations = registry.resolveAll();

    expect(registrations.map((registration) => registration.name)).toEqual(["critical", "high", "normal", "low"]);
    expect(Object.isFrozen(registrations)).toBe(true);
    expect(Object.isFrozen(registrations[0])).toBe(true);
  });
});

describe("PricingPolicyPipeline", () => {
  it("executes policies in priority order", () => {
    const registry = new PricingPolicyRegistry();
    const events: string[] = [];

    registry.register(
      "normal",
      {
        evaluate: () => {
          events.push("normal");
          return createPolicyResult("normal", PricingPolicyOutcome.APPLY, PricingPolicyPriority.NORMAL);
        },
      },
      PricingPolicyPriority.NORMAL,
    );

    registry.register(
      "critical",
      {
        evaluate: () => {
          events.push("critical");
          return createPolicyResult("critical", PricingPolicyOutcome.APPLY, PricingPolicyPriority.CRITICAL);
        },
      },
      PricingPolicyPriority.CRITICAL,
    );

    registry.register(
      "high",
      {
        evaluate: () => {
          events.push("high");
          return createPolicyResult("high", PricingPolicyOutcome.APPLY, PricingPolicyPriority.HIGH);
        },
      },
      PricingPolicyPriority.HIGH,
    );

    const pipeline = new PricingPolicyPipeline(registry);
    const result = pipeline.evaluate(createContext());

    expect(events).toEqual(["critical", "high", "normal"]);
    expect(result.permitted).toBe(true);
    expect(result.strategySet.strategies).toHaveLength(3);
  });

  it("terminates on critical denial", () => {
    const registry = new PricingPolicyRegistry();
    const events: string[] = [];

    registry.register(
      "critical-deny",
      {
        evaluate: () => {
          events.push("critical-deny");
          return createPolicyResult("critical-deny", PricingPolicyOutcome.DENY, PricingPolicyPriority.CRITICAL);
        },
      },
      PricingPolicyPriority.CRITICAL,
    );

    registry.register(
      "normal",
      {
        evaluate: () => {
          events.push("normal");
          return createPolicyResult("normal", PricingPolicyOutcome.APPLY, PricingPolicyPriority.NORMAL);
        },
      },
      PricingPolicyPriority.NORMAL,
    );

    const pipeline = new PricingPolicyPipeline(registry);
    const result = pipeline.evaluate(createContext());

    expect(events).toEqual(["critical-deny"]);
    expect(result.permitted).toBe(false);
    expect(result.outcome).toBe(PricingPolicyOutcome.DENY);
    expect(result.errors).toEqual(["deny"]);
  });

  it("returns immutable strategy sets and constructor-injected results", () => {
    const registry = new PricingPolicyRegistry();

    registry.register(
      "warning",
      {
        evaluate: () => createPolicyResult("warning", PricingPolicyOutcome.WARNING, PricingPolicyPriority.NORMAL),
      },
      PricingPolicyPriority.NORMAL,
    );

    const pipeline = new PricingPolicyPipeline(registry);
    const result = pipeline.evaluate(createContext());

    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.strategySet)).toBe(true);
    expect(Object.isFrozen(result.strategySet.strategies)).toBe(true);
    expect(Object.isFrozen(result.policyResults)).toBe(true);
    expect(Object.isFrozen(result.errors)).toBe(true);
    expect(Object.isFrozen(result.warnings)).toBe(true);
  });
});

describe("Pricing policy contracts", () => {
  it("exposes initial policy family contracts with compile-safe signatures", () => {
    const promotion: PromotionPolicy = {
      evaluate: () => createPolicyResult("promotion", PricingPolicyOutcome.APPLY, PricingPolicyPriority.HIGH),
    };
    const corporate: CorporatePricingPolicy = {
      evaluate: () => createPolicyResult("corporate", PricingPolicyOutcome.APPLY, PricingPolicyPriority.HIGH),
    };
    const seasonal: SeasonalPricingPolicy = {
      evaluate: () => createPolicyResult("seasonal", PricingPolicyOutcome.WARNING, PricingPolicyPriority.NORMAL),
    };
    const loyalty: LoyaltyPricingPolicy = {
      evaluate: () => createPolicyResult("loyalty", PricingPolicyOutcome.IGNORE, PricingPolicyPriority.LOW),
    };
    const commission: CommissionPolicy = {
      evaluate: () => createPolicyResult("commission", PricingPolicyOutcome.APPLY, PricingPolicyPriority.NORMAL),
    };
    const markup: MarkupPolicy = {
      evaluate: () => createPolicyResult("markup", PricingPolicyOutcome.APPLY, PricingPolicyPriority.NORMAL),
    };

    expect(typeof promotion.evaluate).toBe("function");
    expect(typeof corporate.evaluate).toBe("function");
    expect(typeof seasonal.evaluate).toBe("function");
    expect(typeof loyalty.evaluate).toBe("function");
    expect(typeof commission.evaluate).toBe("function");
    expect(typeof markup.evaluate).toBe("function");
  });
});

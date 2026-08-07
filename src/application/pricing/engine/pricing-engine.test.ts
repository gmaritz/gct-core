import {
  createPricingValidationError,
  createPricingValidationResult,
  PricingValidationErrorCode,
  PricingValidationPipeline,
  PricingValidationRequest,
  PricingValidationStage,
} from "@application/pricing/validation";
import {
  createPricingStrategySet,
  PricingPolicyEvaluation,
  PricingPolicyOutcome,
  PricingPolicyPipeline,
  PricingPolicyPriority,
} from "@application/pricing/policies";
import {
  createPricingCalculationResult,
  PricingCalculationResult,
  PricingCalculatorPipeline,
} from "@application/pricing/calculators";
import {
  createMoney,
  createPricingBreakdown,
  createPricingLineItem,
  createPricingSummary,
  createPricingTotal,
  createTax,
  createTaxBreakdown,
  Currency,
  Pricing,
  TaxType,
} from "@application/pricing";
import {
  createPricingEngineContext,
  PricingEngine,
  PricingEngineRequest,
  withEngineCalculationContext,
  withEnginePolicyEvaluation,
  withEnginePricingAggregate,
  withEngineValidationResult,
} from "@application/pricing/engine";

function createRequest(): PricingEngineRequest {
  const pricingRequest: PricingValidationRequest = {
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

  return {
    requestId: "pricing-engine-request-001",
    market: "ZA",
    salesChannel: "DIRECT",
    bookingDate: new Date("2026-08-07T00:00:00.000Z"),
    travellerCount: 2,
    residentCountry: "ZA",
    destination: "Cape Town",
    commercialMetadata: {
      segment: "premium",
    },
    pricingRequest,
  };
}

function createValidation(valid: boolean) {
  return createPricingValidationResult({
    stage: PricingValidationStage.REQUEST,
    errors: valid
      ? []
      : [
          createPricingValidationError({
            code: PricingValidationErrorCode.MISSING_PRICING_INPUTS,
            stage: PricingValidationStage.REQUEST,
            message: "invalid request",
            critical: true,
          }),
        ],
    warnings: valid ? [] : ["validation warning"],
    metadata: {
      validatedAt: new Date("2026-08-07T00:00:00.000Z"),
      version: "1.0.0",
      source: "test",
    },
  });
}

function createPolicy(permitted: boolean): PricingPolicyEvaluation {
  return Object.freeze({
    permitted,
    outcome: permitted ? PricingPolicyOutcome.APPLY : PricingPolicyOutcome.DENY,
    priority: permitted ? PricingPolicyPriority.NORMAL : PricingPolicyPriority.CRITICAL,
    strategySet: createPricingStrategySet({
      strategies: [
        {
          id: "base-strategy",
          type: "BASE",
          profile: "default",
        },
      ],
      warnings: [],
      metadata: {
        generatedAt: new Date("2026-08-07T00:00:00.000Z"),
        version: "1.0.0",
        source: "test",
      },
    }),
    policyResults: Object.freeze([]),
    errors: permitted ? Object.freeze([]) : Object.freeze(["policy denied"]),
    warnings: permitted ? Object.freeze([]) : Object.freeze(["policy warning"]),
    metadata: Object.freeze({
      evaluatedAt: new Date("2026-08-07T00:00:00.000Z"),
      version: "1.0.0",
      source: "test",
    }),
  });
}

function createCalculationResult(): PricingCalculationResult {
  return createPricingCalculationResult({
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
    totals: createPricingTotal({
      subtotal: createMoney({ amount: 44000, currency: Currency.ZAR }),
      taxTotal: createMoney({ amount: 4400, currency: Currency.ZAR }),
      feeTotal: createMoney({ amount: 0, currency: Currency.ZAR }),
      discountTotal: createMoney({ amount: 0, currency: Currency.ZAR }),
      markupTotal: createMoney({ amount: 0, currency: Currency.ZAR }),
      commissionTotal: createMoney({ amount: 0, currency: Currency.ZAR }),
      grandTotal: createMoney({ amount: 48400, currency: Currency.ZAR }),
    }),
    warnings: ["calculation warning"],
    metadata: {
      calculatedAt: new Date("2026-08-07T00:00:00.000Z"),
      version: "1.0.0",
      source: "test",
      calculatorsExecuted: ["total"],
    },
  });
}

describe("PricingEngine", () => {
  it("supports constructor injection and compile safety", async () => {
    const service = new PricingEngine(
      {
        execute: () => createValidation(true),
      } as unknown as PricingValidationPipeline,
      {
        evaluate: () => createPolicy(true),
      } as unknown as PricingPolicyPipeline,
      {
        execute: () => createCalculationResult(),
      } as unknown as PricingCalculatorPipeline,
    );

    const result = await service.execute(createRequest());

    expect(result.successful).toBe(true);
  });

  it("orchestrates validation, policy and calculator in order", async () => {
    const events: string[] = [];

    const service = new PricingEngine(
      {
        execute: () => {
          events.push("validation");
          return createValidation(true);
        },
      } as unknown as PricingValidationPipeline,
      {
        evaluate: () => {
          events.push("policy");
          return createPolicy(true);
        },
      } as unknown as PricingPolicyPipeline,
      {
        execute: () => {
          events.push("calculator");
          return createCalculationResult();
        },
      } as unknown as PricingCalculatorPipeline,
    );

    const result = await service.execute(createRequest());

    expect(events).toEqual(["validation", "policy", "calculator"]);
    expect(result.successful).toBe(true);
    expect(result.pricing?.identity.id).toBe("pricing-pricing-engine-request-001");
  });

  it("stops when validation fails", async () => {
    const events: string[] = [];

    const service = new PricingEngine(
      {
        execute: () => {
          events.push("validation");
          return createValidation(false);
        },
      } as unknown as PricingValidationPipeline,
      {
        evaluate: () => {
          events.push("policy");
          return createPolicy(true);
        },
      } as unknown as PricingPolicyPipeline,
      {
        execute: () => {
          events.push("calculator");
          return createCalculationResult();
        },
      } as unknown as PricingCalculatorPipeline,
    );

    const result = await service.execute(createRequest());

    expect(events).toEqual(["validation"]);
    expect(result.successful).toBe(false);
    expect(result.pricing).toBeNull();
    expect(result.warnings).toEqual(["validation warning", "invalid request"]);
  });

  it("stops when policy denies request", async () => {
    const events: string[] = [];

    const service = new PricingEngine(
      {
        execute: () => {
          events.push("validation");
          return createValidation(true);
        },
      } as unknown as PricingValidationPipeline,
      {
        evaluate: () => {
          events.push("policy");
          return createPolicy(false);
        },
      } as unknown as PricingPolicyPipeline,
      {
        execute: () => {
          events.push("calculator");
          return createCalculationResult();
        },
      } as unknown as PricingCalculatorPipeline,
    );

    const result = await service.execute(createRequest());

    expect(events).toEqual(["validation", "policy"]);
    expect(result.successful).toBe(false);
    expect(result.pricing).toBeNull();
    expect(result.warnings).toEqual(["policy warning", "policy denied"]);
  });

  it("returns immutable successful result and aggregate", async () => {
    const service = new PricingEngine(
      {
        execute: () => createValidation(true),
      } as unknown as PricingValidationPipeline,
      {
        evaluate: () => createPolicy(true),
      } as unknown as PricingPolicyPipeline,
      {
        execute: () => createCalculationResult(),
      } as unknown as PricingCalculatorPipeline,
    );

    const result = await service.execute(createRequest());

    expect(result.successful).toBe(true);
    expect(result.pricing?.summary.productId).toBe("journey-2001");
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.warnings)).toBe(true);
    expect(Object.isFrozen(result.metadata)).toBe(true);
    expect(Object.isFrozen(result.metadata.stages)).toBe(true);
    expect(Object.isFrozen(result.pricing)).toBe(true);
  });
});

describe("PricingEngineContext", () => {
  it("creates immutable context and supports stage enrichment", () => {
    const request = createRequest();
    const context = createPricingEngineContext(request);
    const withValidation = withEngineValidationResult(context, createValidation(true));
    const withPolicy = withEnginePolicyEvaluation(withValidation, createPolicy(true));

    const calculationContext = {
      pricingRequest: request.pricingRequest,
      pricingStrategySet: createPolicy(true).strategySet,
      currentPricingBreakdown: request.pricingRequest.breakdown!,
      calculatedTotals: request.pricingRequest.totals!,
      currency: request.pricingRequest.currency!,
      warnings: [],
      calculationMetadata: {
        calculatedAt: new Date("2026-08-07T00:00:00.000Z"),
        version: "1.0.0",
        source: "test",
      },
    };

    const withCalculation = withEngineCalculationContext(withPolicy, calculationContext);

    const withAggregate = withEnginePricingAggregate(withCalculation, createAggregate());

    expect(Object.isFrozen(context)).toBe(true);
    expect(Object.isFrozen(context.metadata)).toBe(true);
    expect(withValidation.validationResult?.valid).toBe(true);
    expect(withPolicy.pricingPolicyEvaluation?.permitted).toBe(true);
    expect(withCalculation.pricingCalculationContext).toBeDefined();
    expect(withAggregate.pricingAggregate?.identity.id).toBe("pricing-aggregate-001");
    expect(withAggregate.metadata.stages).toEqual([
      "CONTEXT",
      "VALIDATION",
      "POLICY",
      "CALCULATION",
      "AGGREGATE",
    ]);
  });
});

function createAggregate(): Pricing {
  const result = createCalculationResult();
  const request = createRequest();

  return Pricing.create({
    identity: { id: "pricing-aggregate-001" },
    summary: request.pricingRequest.summary!,
    breakdown: result.breakdown,
    taxes: request.pricingRequest.taxes!,
    fees: request.pricingRequest.fees ?? [],
    discounts: request.pricingRequest.discounts ?? [],
    markups: request.pricingRequest.markups ?? [],
    commissions: request.pricingRequest.commissions ?? [],
    totals: result.totals,
    currency: request.pricingRequest.currency!,
    metadata: {
      createdAt: new Date("2026-08-07T00:00:00.000Z"),
      updatedAt: new Date("2026-08-07T00:00:00.000Z"),
      version: "1.0.0",
      source: "test",
    },
  });
}

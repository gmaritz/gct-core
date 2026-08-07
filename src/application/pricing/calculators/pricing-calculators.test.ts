import {
  createMoney,
  createPricingBreakdown,
  createPricingLineItem,
  createPricingSummary,
  createPricingTotal,
  createTax,
  createTaxBreakdown,
  createPricingStrategySet,
  Currency,
  PricingValidationRequest,
  PricingStrategySet,
  TaxType,
} from "@application/pricing";
import {
  AccommodationCalculator,
  CommissionCalculator,
  createPricingCalculationContext,
  createPricingCalculationResult,
  DiscountCalculator,
  ExperienceCalculator,
  MarkupCalculator,
  PricingCalculationContext,
  PricingCalculationResult,
  PricingCalculator,
  PricingCalculatorPipeline,
  PricingCalculatorPriority,
  PricingCalculatorRegistry,
  PricingCalculatorStage,
  PromotionCalculator,
  TaxCalculator,
  TotalCalculator,
} from "@application/pricing/calculators";

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

function createStrategySet(): PricingStrategySet {
  return createPricingStrategySet({
    strategies: [
      {
        id: "seasonal-strategy",
        type: "SEASONAL",
        profile: "peak-season",
      },
    ],
    warnings: [],
    metadata: {
      generatedAt: new Date("2026-08-07T00:00:00.000Z"),
      version: "1.0.0",
      source: "test",
    },
  });
}

function createContext(): PricingCalculationContext {
  const breakdown = createPricingBreakdown({
    lineItems: [
      createPricingLineItem({
        code: "BASE",
        label: "Base",
        unitAmount: createMoney({ amount: 22000, currency: Currency.ZAR }),
        totalAmount: createMoney({ amount: 44000, currency: Currency.ZAR }),
        quantity: 2,
      }),
    ],
  });

  const totals = createPricingTotal({
    subtotal: createMoney({ amount: 44000, currency: Currency.ZAR }),
    taxTotal: createMoney({ amount: 4400, currency: Currency.ZAR }),
    feeTotal: createMoney({ amount: 0, currency: Currency.ZAR }),
    discountTotal: createMoney({ amount: 0, currency: Currency.ZAR }),
    markupTotal: createMoney({ amount: 0, currency: Currency.ZAR }),
    commissionTotal: createMoney({ amount: 0, currency: Currency.ZAR }),
    grandTotal: createMoney({ amount: 48400, currency: Currency.ZAR }),
  });

  return createPricingCalculationContext({
    pricingRequest: createRequest(),
    pricingStrategySet: createStrategySet(),
    currentPricingBreakdown: breakdown,
    calculatedTotals: totals,
    currency: Currency.ZAR,
    warnings: [],
    calculationMetadata: {
      calculatedAt: new Date("2026-08-07T00:00:00.000Z"),
      version: "1.0.0",
      source: "test",
    },
  });
}

function createStageCalculator(stage: PricingCalculatorStage, marker: string): PricingCalculator {
  return {
    stage,
    calculate: (context) =>
      createPricingCalculationContext({
        ...context,
        warnings: [...context.warnings, marker],
        calculationMetadata: {
          ...context.calculationMetadata,
          currentStage: stage,
        },
      }),
  };
}

describe("PricingCalculatorRegistry", () => {
  it("registers and resolves calculators", () => {
    const registry = new PricingCalculatorRegistry();
    const calculator = createStageCalculator(PricingCalculatorStage.ACCOMMODATION, "accommodation");

    registry.register("accommodation", calculator, PricingCalculatorPriority.HIGH);

    const resolved = registry.resolve("accommodation");

    expect(resolved).toBeDefined();
    expect(resolved?.name).toBe("accommodation");
    expect(resolved?.stage).toBe(PricingCalculatorStage.ACCOMMODATION);
    expect(resolved?.priority).toBe(PricingCalculatorPriority.HIGH);
  });

  it("rejects duplicate registration", () => {
    const registry = new PricingCalculatorRegistry();
    const calculator = createStageCalculator(PricingCalculatorStage.DISCOUNT, "discount");

    registry.register("discount", calculator, PricingCalculatorPriority.NORMAL);

    expect(() => registry.register("discount", calculator, PricingCalculatorPriority.HIGH)).toThrow(
      "Pricing calculator 'discount' is already registered.",
    );
  });

  it("unregisters calculators", () => {
    const registry = new PricingCalculatorRegistry();
    const calculator = createStageCalculator(PricingCalculatorStage.TAX, "tax");

    registry.register("tax", calculator, PricingCalculatorPriority.NORMAL);

    expect(registry.unregister("tax")).toBe(true);
    expect(registry.resolve("tax")).toBeUndefined();
    expect(registry.unregister("tax")).toBe(false);
  });

  it("orders calculators deterministically and returns immutable collections", () => {
    const registry = new PricingCalculatorRegistry();

    registry.register("high-experience", createStageCalculator(PricingCalculatorStage.EXPERIENCE, "exp"), PricingCalculatorPriority.HIGH);
    registry.register("normal-accommodation", createStageCalculator(PricingCalculatorStage.ACCOMMODATION, "acc"), PricingCalculatorPriority.NORMAL);
    registry.register("highest-accommodation", createStageCalculator(PricingCalculatorStage.ACCOMMODATION, "acc2"), PricingCalculatorPriority.HIGHEST);
    registry.register("total", createStageCalculator(PricingCalculatorStage.TOTAL, "total"), PricingCalculatorPriority.NORMAL);

    const resolved = registry.resolveAll();

    expect(resolved.map((entry) => entry.name)).toEqual([
      "highest-accommodation",
      "normal-accommodation",
      "high-experience",
      "total",
    ]);
    expect(Object.isFrozen(resolved)).toBe(true);
    expect(Object.isFrozen(resolved[0])).toBe(true);
  });
});

describe("PricingCalculatorPipeline", () => {
  it("executes calculators in deterministic stage/priority order", () => {
    const registry = new PricingCalculatorRegistry();
    const order: string[] = [];

    registry.register(
      "promotion",
      {
        stage: PricingCalculatorStage.PROMOTION,
        calculate: (context) => {
          order.push("promotion");
          return createPricingCalculationContext({ ...context, warnings: [...context.warnings, "promotion"] });
        },
      },
      PricingCalculatorPriority.NORMAL,
    );

    registry.register(
      "accommodation",
      {
        stage: PricingCalculatorStage.ACCOMMODATION,
        calculate: (context) => {
          order.push("accommodation");
          return createPricingCalculationContext({ ...context, warnings: [...context.warnings, "accommodation"] });
        },
      },
      PricingCalculatorPriority.NORMAL,
    );

    registry.register(
      "total",
      {
        stage: PricingCalculatorStage.TOTAL,
        calculate: (context) => {
          order.push("total");
          return createPricingCalculationContext({ ...context, warnings: [...context.warnings, "total"] });
        },
      },
      PricingCalculatorPriority.NORMAL,
    );

    const pipeline = new PricingCalculatorPipeline(registry);
    const result = pipeline.execute(createContext());

    expect(order).toEqual(["accommodation", "promotion", "total"]);
    expect(result.metadata.calculatorsExecuted).toEqual(["accommodation", "promotion", "total"]);
    expect(result.warnings).toEqual(["accommodation", "promotion", "total"]);
  });

  it("propagates immutable context and aggregates immutable results", () => {
    const registry = new PricingCalculatorRegistry();
    const contexts: PricingCalculationContext[] = [];

    registry.register(
      "accommodation",
      {
        stage: PricingCalculatorStage.ACCOMMODATION,
        calculate: (context) => {
          contexts.push(context);
          return createPricingCalculationContext({ ...context, warnings: [...context.warnings, "accommodation"] });
        },
      },
      PricingCalculatorPriority.NORMAL,
    );

    registry.register(
      "total",
      {
        stage: PricingCalculatorStage.TOTAL,
        calculate: (context) => {
          contexts.push(context);
          return createPricingCalculationContext({ ...context, warnings: [...context.warnings, "total"] });
        },
      },
      PricingCalculatorPriority.NORMAL,
    );

    const pipeline = new PricingCalculatorPipeline(registry);
    const result = pipeline.execute(createContext());

    expect(Object.isFrozen(contexts[0])).toBe(true);
    expect(Object.isFrozen(contexts[1])).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.breakdown)).toBe(true);
    expect(Object.isFrozen(result.totals)).toBe(true);
    expect(Object.isFrozen(result.warnings)).toBe(true);
    expect(Object.isFrozen(result.metadata.calculatorsExecuted)).toBe(true);
  });

  it("supports constructor injection", () => {
    const registry = new PricingCalculatorRegistry();

    registry.register("total", createStageCalculator(PricingCalculatorStage.TOTAL, "total"), PricingCalculatorPriority.NORMAL);

    const pipeline = new PricingCalculatorPipeline(registry);
    const result = pipeline.execute(createContext());

    expect(result.metadata.calculatorsExecuted).toEqual(["total"]);
  });
});

describe("Pricing calculator contracts", () => {
  it("provides compile-safe family contracts", () => {
    const accommodationCalculator: AccommodationCalculator = createStageCalculator(
      PricingCalculatorStage.ACCOMMODATION,
      "accommodation",
    );
    const experienceCalculator: ExperienceCalculator = createStageCalculator(
      PricingCalculatorStage.EXPERIENCE,
      "experience",
    );
    const promotionCalculator: PromotionCalculator = createStageCalculator(
      PricingCalculatorStage.PROMOTION,
      "promotion",
    );
    const discountCalculator: DiscountCalculator = createStageCalculator(
      PricingCalculatorStage.DISCOUNT,
      "discount",
    );
    const taxCalculator: TaxCalculator = createStageCalculator(PricingCalculatorStage.TAX, "tax");
    const markupCalculator: MarkupCalculator = createStageCalculator(PricingCalculatorStage.MARKUP, "markup");
    const commissionCalculator: CommissionCalculator = createStageCalculator(
      PricingCalculatorStage.COMMISSION,
      "commission",
    );
    const totalCalculator: TotalCalculator = createStageCalculator(PricingCalculatorStage.TOTAL, "total");

    expect(typeof accommodationCalculator.calculate).toBe("function");
    expect(typeof experienceCalculator.calculate).toBe("function");
    expect(typeof promotionCalculator.calculate).toBe("function");
    expect(typeof discountCalculator.calculate).toBe("function");
    expect(typeof taxCalculator.calculate).toBe("function");
    expect(typeof markupCalculator.calculate).toBe("function");
    expect(typeof commissionCalculator.calculate).toBe("function");
    expect(typeof totalCalculator.calculate).toBe("function");
  });

  it("creates immutable context and immutable result contracts", () => {
    const context = createContext();
    const result: PricingCalculationResult = createPricingCalculationResult({
      breakdown: context.currentPricingBreakdown,
      totals: context.calculatedTotals,
      warnings: ["ok"],
      metadata: {
        calculatedAt: new Date("2026-08-07T00:00:00.000Z"),
        version: "1.0.0",
        source: "test",
        calculatorsExecuted: ["total"],
      },
    });

    expect(Object.isFrozen(context)).toBe(true);
    expect(Object.isFrozen(context.currentPricingBreakdown)).toBe(true);
    expect(Object.isFrozen(context.calculatedTotals)).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.breakdown)).toBe(true);
    expect(Object.isFrozen(result.totals)).toBe(true);
    expect(Object.isFrozen(result.warnings)).toBe(true);
    expect(Object.isFrozen(result.metadata)).toBe(true);
    expect(Object.isFrozen(result.metadata.calculatorsExecuted)).toBe(true);
  });
});

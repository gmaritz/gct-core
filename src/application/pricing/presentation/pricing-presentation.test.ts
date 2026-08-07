import {
  createMoney,
  createPricingBreakdown,
  createPricingLineItem,
  createPricingSummary,
  createPricingTotal,
  createTax,
  createTaxBreakdown,
  createPricingMetadata,
  Currency,
  Pricing,
  TaxType,
} from "@application/pricing";
import {
  createPricingEngineResult,
  PricingEngineResult,
} from "@application/pricing/engine";

import { PricingPresentationMapper } from "./pricing-presentation-mapper";
import { PricingViewModelProvider } from "./pricing-view-model-provider";

function createPricingAggregate(): Pricing {
  return Pricing.create({
    identity: {
      id: "pricing-7001",
    },
    summary: createPricingSummary({
      productId: "journey-7001",
      productType: "JOURNEY",
      description: "Cape Town Signature",
    }),
    breakdown: createPricingBreakdown({
      lineItems: [
        createPricingLineItem({
          code: "ACCOMMODATION_BASE",
          label: "Accommodation",
          unitAmount: createMoney({ amount: 18000, currency: Currency.ZAR }),
          totalAmount: createMoney({ amount: 36000, currency: Currency.ZAR }),
          quantity: 2,
        }),
        createPricingLineItem({
          code: "EXPERIENCE_PREMIUM",
          label: "Experiences",
          unitAmount: createMoney({ amount: 4000, currency: Currency.ZAR }),
          totalAmount: createMoney({ amount: 4000, currency: Currency.ZAR }),
          quantity: 1,
        }),
      ],
    }),
    taxes: createTaxBreakdown({
      entries: [
        createTax({
          code: "VAT",
          type: TaxType.VAT,
          amount: createMoney({ amount: 3800, currency: Currency.ZAR }),
        }),
      ],
      total: createMoney({ amount: 3800, currency: Currency.ZAR }),
    }),
    fees: [],
    discounts: [],
    markups: [],
    commissions: [],
    totals: createPricingTotal({
      subtotal: createMoney({ amount: 40000, currency: Currency.ZAR }),
      taxTotal: createMoney({ amount: 3800, currency: Currency.ZAR }),
      feeTotal: createMoney({ amount: 0, currency: Currency.ZAR }),
      discountTotal: createMoney({ amount: 1200, currency: Currency.ZAR }),
      markupTotal: createMoney({ amount: 900, currency: Currency.ZAR }),
      commissionTotal: createMoney({ amount: 500, currency: Currency.ZAR }),
      grandTotal: createMoney({ amount: 43000, currency: Currency.ZAR }),
    }),
    currency: Currency.ZAR,
    metadata: createPricingMetadata({
      createdAt: new Date("2026-08-07T10:00:00.000Z"),
      updatedAt: new Date("2026-08-07T10:00:00.000Z"),
      version: "1.0.0",
      source: "test",
    }),
  });
}

function createEngineResult(overrides?: Partial<PricingEngineResult>): PricingEngineResult {
  const base = createPricingEngineResult({
    successful: true,
    pricing: createPricingAggregate(),
    warnings: ["Limited-time promotional saving applied"],
    metadata: {
      completedAt: new Date("2026-08-07T10:05:00.000Z"),
      version: "1.0.0",
      requestId: "pricing-request-7001",
      stages: ["CONTEXT", "VALIDATION", "POLICY", "CALCULATION", "AGGREGATE"],
    },
  });

  if (!overrides) {
    return base;
  }

  return createPricingEngineResult({
    successful: overrides.successful ?? base.successful,
    pricing: typeof overrides.pricing === "undefined" ? base.pricing : overrides.pricing,
    warnings: overrides.warnings ?? base.warnings,
    metadata: {
      completedAt: overrides.metadata?.completedAt ?? base.metadata.completedAt,
      version: overrides.metadata?.version ?? base.metadata.version,
      requestId: overrides.metadata?.requestId ?? base.metadata.requestId,
      stages: overrides.metadata?.stages ?? base.metadata.stages,
    },
  });
}

describe("PricingPresentationMapper", () => {
  it("maps successful pricing results to summary, breakdown and quote models", () => {
    const mapper = new PricingPresentationMapper();
    const output = mapper.map(createEngineResult());

    expect(output).not.toBeNull();
    expect(output?.summary.totalPrice).toBe(43000);
    expect(output?.summary.currency).toBe(Currency.ZAR);
    expect(output?.summary.travellerCount).toBe(3);
    expect(output?.breakdown.accommodationSubtotal).toBe(36000);
    expect(output?.breakdown.experiencesSubtotal).toBe(4000);
    expect(output?.quote.quoteStatus).toBe("DRAFT");
    expect(output?.quote.quotationReference).toBe("pricing-7001");
    expect(Object.isFrozen(output)).toBe(true);
    expect(Object.isFrozen(output?.summary)).toBe(true);
    expect(Object.isFrozen(output?.breakdown)).toBe(true);
    expect(Object.isFrozen(output?.quote)).toBe(true);
  });

  it("returns null when pricing result is unsuccessful", () => {
    const mapper = new PricingPresentationMapper();

    const output = mapper.map(createEngineResult({ successful: false, pricing: null }));

    expect(output).toBeNull();
  });
});

describe("PricingViewModelProvider", () => {
  it("transforms presentation models into ui-ready view models with defaults", () => {
    const mapper = new PricingPresentationMapper();
    const output = mapper.map(createEngineResult());

    if (!output) {
      throw new Error("Expected pricing presentation output");
    }

    const provider = new PricingViewModelProvider(mapper);
    const viewModel = provider.provideViewModel(
      output.summary,
      output.breakdown,
      output.quote,
      "pricing-request-7001",
    );

    expect(viewModel.summary.totalPrice).toBe(43000);
    expect(viewModel.cta.label).toBe("Continue to Booking");
    expect(viewModel.cta.style).toBe("primary");
    expect(viewModel.badgeStyles.quoteStatus).toBe("neutral");
    expect(viewModel.badgeStyles.priceSignal).toBe("positive");
    expect(viewModel.displayLabels.totalLabel).toBe("ZAR 43000.00");
    expect(viewModel.metadata.requestId).toBe("pricing-request-7001");
    expect(Object.isFrozen(viewModel)).toBe(true);
    expect(Object.isFrozen(viewModel.cta)).toBe(true);
    expect(Object.isFrozen(viewModel.badgeStyles)).toBe(true);
    expect(Object.isFrozen(viewModel.displayLabels)).toBe(true);
  });

  it("maps pricing engine results directly to pricing view models", () => {
    const provider = new PricingViewModelProvider();
    const viewModel = provider.mapPricingResultToViewModel(createEngineResult());

    expect(viewModel?.summary.currency).toBe(Currency.ZAR);
    expect(viewModel?.quote.quotationReference).toBe("pricing-7001");
  });

  it("returns null when mapper has no successful presentation output", () => {
    const provider = new PricingViewModelProvider();
    const viewModel = provider.mapPricingResultToViewModel(
      createEngineResult({ successful: false, pricing: null }),
    );

    expect(viewModel).toBeNull();
  });
});

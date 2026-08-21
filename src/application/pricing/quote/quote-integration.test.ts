import {
  createMoney,
  createPricingBreakdown,
  createPricingLineItem,
  createPricingMetadata,
  createPricingSummary,
  createPricingTotal,
  createTax,
  createTaxBreakdown,
  Currency,
  Pricing,
  TaxType,
} from "@application/pricing";
import { createPricingEngineResult, PricingEngine, PricingEngineRequest } from "@application/pricing/engine";

import { QuoteFactory } from "./quote-factory";
import { QuoteIntegrationRequest, QuoteIntegrationService } from "./quote-integration-service";
import { createQuoteContext } from "./models";

function createPricingAggregate(): Pricing {
  return Pricing.create({
    identity: { id: "pricing-8001" },
    summary: createPricingSummary({
      productId: "journey-8001",
      productType: "JOURNEY",
      description: "West Coast Signature",
    }),
    breakdown: createPricingBreakdown({
      lineItems: [
        createPricingLineItem({
          code: "ACCOMMODATION_BASE",
          label: "Accommodation",
          unitAmount: createMoney({ amount: 10000, currency: Currency.ZAR }),
          totalAmount: createMoney({ amount: 20000, currency: Currency.ZAR }),
          quantity: 2,
        }),
      ],
    }),
    taxes: createTaxBreakdown({
      entries: [
        createTax({
          code: "VAT",
          type: TaxType.VAT,
          amount: createMoney({ amount: 3000, currency: Currency.ZAR }),
        }),
      ],
      total: createMoney({ amount: 3000, currency: Currency.ZAR }),
    }),
    fees: [],
    discounts: [],
    markups: [],
    commissions: [],
    totals: createPricingTotal({
      subtotal: createMoney({ amount: 20000, currency: Currency.ZAR }),
      taxTotal: createMoney({ amount: 3000, currency: Currency.ZAR }),
      feeTotal: createMoney({ amount: 0, currency: Currency.ZAR }),
      discountTotal: createMoney({ amount: 500, currency: Currency.ZAR }),
      markupTotal: createMoney({ amount: 250, currency: Currency.ZAR }),
      commissionTotal: createMoney({ amount: 150, currency: Currency.ZAR }),
      grandTotal: createMoney({ amount: 22900, currency: Currency.ZAR }),
    }),
    currency: Currency.ZAR,
    metadata: createPricingMetadata({
      createdAt: new Date("2026-08-07T13:00:00.000Z"),
      updatedAt: new Date("2026-08-07T13:00:00.000Z"),
      version: "1.0.0",
      source: "test",
    }),
  });
}

function createSuccessfulPricingEngineResult(): ReturnType<typeof createPricingEngineResult> {
  return createPricingEngineResult({
    successful: true,
    pricing: createPricingAggregate(),
    warnings: ["Promotional saving applied"],
    metadata: {
      completedAt: new Date("2026-08-07T13:10:00.000Z"),
      version: "1.0.0",
      requestId: "pricing-request-8001",
      stages: ["CONTEXT", "VALIDATION", "POLICY", "CALCULATION", "AGGREGATE"],
    },
  });
}

function createFailedPricingEngineResult(): ReturnType<typeof createPricingEngineResult> {
  return createPricingEngineResult({
    successful: false,
    pricing: null,
    warnings: ["Pricing failed policy checks"],
    metadata: {
      completedAt: new Date("2026-08-07T13:10:00.000Z"),
      version: "1.0.0",
      requestId: "pricing-request-8002",
      stages: ["CONTEXT", "VALIDATION", "POLICY"],
    },
  });
}

function createRequest(): QuoteIntegrationRequest {
  return Object.freeze({
    pricingEngineRequest: Object.freeze({
      pricingRequest: Object.freeze({
        currency: Currency.ZAR,
        summary: createPricingSummary({
          productId: "journey-8001",
          productType: "JOURNEY",
          description: "West Coast Signature",
        }),
        breakdown: createPricingBreakdown({
          lineItems: [
            createPricingLineItem({
              code: "ACCOMMODATION_BASE",
              label: "Accommodation",
              unitAmount: createMoney({ amount: 10000, currency: Currency.ZAR }),
              totalAmount: createMoney({ amount: 20000, currency: Currency.ZAR }),
              quantity: 2,
            }),
          ],
        }),
        taxes: createTaxBreakdown({
          entries: [],
          total: createMoney({ amount: 0, currency: Currency.ZAR }),
        }),
        fees: [],
        discounts: [],
        markups: [],
        commissions: [],
        promotions: [],
        totals: createPricingTotal({
          subtotal: createMoney({ amount: 20000, currency: Currency.ZAR }),
          taxTotal: createMoney({ amount: 0, currency: Currency.ZAR }),
          feeTotal: createMoney({ amount: 0, currency: Currency.ZAR }),
          discountTotal: createMoney({ amount: 0, currency: Currency.ZAR }),
          markupTotal: createMoney({ amount: 0, currency: Currency.ZAR }),
          commissionTotal: createMoney({ amount: 0, currency: Currency.ZAR }),
          grandTotal: createMoney({ amount: 20000, currency: Currency.ZAR }),
        }),
        quote: null,
      }),
      requestId: "pricing-request-8001",
    }),
    travellerSummary: Object.freeze({
      travellerCount: 2,
      leadTravellerName: "Ari Jacobs",
    }),
    journeySummary: Object.freeze({
      journeyId: "journey-8001",
      title: "West Coast Signature",
      destination: "Cape Town",
      duration: "4 days / 3 nights",
    }),
    quotationMetadata: Object.freeze({
      quotationNumber: "Q-8001",
      externalReference: "EXT-REF-8001",
      customerReference: "CUST-REF-8001",
      validityDays: 14,
      source: "test",
    }),
    requestId: "quote-request-8001",
    source: "test",
  });
}

describe("QuoteFactory", () => {
  it("creates immutable quote output with lifecycle and references", () => {
    const factory = new QuoteFactory();

    const context = createQuoteContext({
      pricingEngineResult: createSuccessfulPricingEngineResult(),
      travellerSummary: {
        travellerCount: 2,
        leadTravellerName: "Ari Jacobs",
      },
      journeySummary: {
        journeyId: "journey-8001",
        title: "West Coast Signature",
        destination: "Cape Town",
        duration: "4 days / 3 nights",
      },
      quotationMetadata: {
        quotationNumber: "Q-8001",
        externalReference: "EXT-REF-8001",
        customerReference: "CUST-REF-8001",
        validityDays: 14,
      },
      requestId: "quote-request-8001",
      source: "test",
    });

    const output = factory.create(context);

    expect(output.quote.id).toBe("Q-8001");
    expect(output.quote.status).toBe("DRAFT");
    expect(output.quote.total.amount).toBe(22900);
    expect(output.quote.items).toHaveLength(1);
    expect(output.quoteReference.externalReference).toBe("EXT-REF-8001");
    expect(output.quoteReference.customerReference).toBe("CUST-REF-8001");
    expect(output.lifecycle.createdAt.toISOString()).toBe(context.createdAt.toISOString());
    expect(output.lifecycle.expiresAt.getTime()).toBeGreaterThan(output.lifecycle.createdAt.getTime());
    expect(Object.isFrozen(output)).toBe(true);
    expect(Object.isFrozen(output.quoteReference)).toBe(true);
    expect(Object.isFrozen(output.lifecycle)).toBe(true);
  });

  it("throws for unsuccessful pricing result", () => {
    const factory = new QuoteFactory();

    const context = createQuoteContext({
      pricingEngineResult: createFailedPricingEngineResult(),
      travellerSummary: {
        travellerCount: 1,
      },
      journeySummary: {
        journeyId: "journey-8002",
      },
    });

    expect(() => factory.create(context)).toThrow("Cannot create quote from unsuccessful pricing result.");
  });
});

describe("QuoteIntegrationService", () => {
  it("invokes pricing engine and quote factory", async () => {
    const callOrder: string[] = [];

    const pricingEngine = {
      execute: jest.fn(async (_request: PricingEngineRequest) => {
        callOrder.push("engine");
        return createSuccessfulPricingEngineResult();
      }),
    } as unknown as PricingEngine;

    const quoteFactory = {
      create: jest.fn((context) => {
        callOrder.push("factory");
        return new QuoteFactory().create(context);
      }),
    } as unknown as QuoteFactory;

    const service = new QuoteIntegrationService(pricingEngine, quoteFactory);
    await service.execute(createRequest());

    expect(callOrder).toEqual(["engine", "factory"]);
  });

  it("returns successful immutable quote result", async () => {
    const pricingEngine = {
      execute: jest.fn(async () => createSuccessfulPricingEngineResult()),
    } as unknown as PricingEngine;

    const service = new QuoteIntegrationService(pricingEngine, new QuoteFactory());
    const result = await service.execute(createRequest());

    expect(result.successful).toBe(true);
    expect(result.quote?.status).toBe("DRAFT");
    expect(result.quoteReference?.quotationNumber).toBe("Q-8001");
    expect(result.lifecycle?.acceptedAt).toBeNull();
    expect(result.warnings).toEqual(["Promotional saving applied"]);
    expect(result.metadata.requestId).toBe("quote-request-8001");
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.warnings)).toBe(true);
    expect(Object.isFrozen(result.metadata)).toBe(true);
  });

  it("returns unsuccessful result when pricing engine result is unsuccessful", async () => {
    const pricingEngine = {
      execute: jest.fn(async () => createFailedPricingEngineResult()),
    } as unknown as PricingEngine;

    const quoteFactory = {
      create: jest.fn(() => {
        throw new Error("Factory should not be called for unsuccessful pricing result");
      }),
    } as unknown as QuoteFactory;

    const service = new QuoteIntegrationService(pricingEngine, quoteFactory);
    const result = await service.execute(createRequest());

    expect(result.successful).toBe(false);
    expect(result.quote).toBeNull();
    expect(result.quoteReference).toBeNull();
    expect(result.lifecycle).toBeNull();
    expect(result.warnings).toEqual(["Pricing failed policy checks"]);
    expect(quoteFactory.create).not.toHaveBeenCalled();
  });
});

import {
  Commission,
  createCommission,
  createDiscount,
  createExchangeRate,
  createFee,
  createMoney,
  createPricingBreakdown,
  createPricingLineItem,
  createPricingMetadata,
  createPricingSummary,
  createPricingTotal,
  createPromotion,
  createQuote,
  createQuoteItem,
  createQuoteMetadata,
  createTax,
  createTaxBreakdown,
  Currency,
  Discount,
  equalsMoney,
  ExchangeRate,
  Fee,
  Markup,
  Promotion,
  Quote,
  QuoteStatus,
  TaxType,
  createMarkup,
} from "@application/pricing";
import { Pricing, PricingComposition } from "@application/pricing/aggregate";

function createAggregateComposition(): PricingComposition {
  return {
    identity: { id: "pricing-aggregate-001" },
    summary: createPricingSummary({
      productId: "journey-9001",
      productType: "JOURNEY",
      description: "Cape Coast itinerary",
    }),
    breakdown: createPricingBreakdown({
      lineItems: [
        createPricingLineItem({
          code: "BASE",
          label: "Base itinerary",
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
    fees: Object.freeze([
      createFee({
        code: "SERVICE",
        label: "Service fee",
        amount: createMoney({ amount: 900, currency: Currency.ZAR }),
      }),
    ]),
    discounts: Object.freeze([
      createDiscount({
        code: "LOYALTY",
        label: "Loyalty discount",
        amount: createMoney({ amount: 700, currency: Currency.ZAR }),
      }),
    ]),
    markups: Object.freeze([
      createMarkup({
        code: "SEASON",
        label: "Seasonal markup",
        amount: createMoney({ amount: 600, currency: Currency.ZAR }),
      }),
    ]),
    commissions: Object.freeze([
      createCommission({
        code: "AGENCY",
        label: "Agency commission",
        amount: createMoney({ amount: 1100, currency: Currency.ZAR }),
      }),
    ]),
    totals: createPricingTotal({
      subtotal: createMoney({ amount: 44000, currency: Currency.ZAR }),
      taxTotal: createMoney({ amount: 4400, currency: Currency.ZAR }),
      feeTotal: createMoney({ amount: 900, currency: Currency.ZAR }),
      discountTotal: createMoney({ amount: 700, currency: Currency.ZAR }),
      markupTotal: createMoney({ amount: 600, currency: Currency.ZAR }),
      commissionTotal: createMoney({ amount: 1100, currency: Currency.ZAR }),
      grandTotal: createMoney({ amount: 50300, currency: Currency.ZAR }),
    }),
    currency: Currency.ZAR,
    metadata: createPricingMetadata({
      createdAt: new Date("2026-08-07T00:00:00.000Z"),
      updatedAt: new Date("2026-08-07T00:00:00.000Z"),
      version: "1.0.0",
      source: "APP-005.2",
    }),
  };
}

describe("Pricing Money Models", () => {
  it("supports immutable money construction and equality", () => {
    const left = createMoney({ amount: 2500, currency: Currency.ZAR });
    const right = createMoney({ amount: 2500, currency: Currency.ZAR });
    const different = createMoney({ amount: 2500, currency: Currency.USD });

    expect(equalsMoney(left, right)).toBe(true);
    expect(equalsMoney(left, different)).toBe(false);
    expect(Object.isFrozen(left)).toBe(true);
  });

  it("supports readonly exchange rate contracts", () => {
    const rate: ExchangeRate = createExchangeRate({
      baseCurrency: Currency.USD,
      quoteCurrency: Currency.ZAR,
      rate: 18.25,
      effectiveAt: new Date("2026-08-07T00:00:00.000Z"),
      source: "ECB",
    });

    expect(rate.quoteCurrency).toBe(Currency.ZAR);
    expect(Object.isFrozen(rate)).toBe(true);
  });
});

describe("Pricing Commercial Models", () => {
  it("constructs immutable commercial values", () => {
    const fee: Fee = createFee({
      code: "SERVICE",
      label: "Service fee",
      amount: createMoney({ amount: 500, currency: Currency.ZAR }),
    });
    const discount: Discount = createDiscount({
      code: "LOYALTY",
      label: "Loyalty discount",
      amount: createMoney({ amount: 300, currency: Currency.ZAR }),
    });
    const markup: Markup = createMarkup({
      code: "PEAK",
      label: "Peak season",
      amount: createMoney({ amount: 200, currency: Currency.ZAR }),
    });
    const commission: Commission = createCommission({
      code: "AGENCY",
      label: "Agency commission",
      amount: createMoney({ amount: 150, currency: Currency.ZAR }),
    });
    const promotion: Promotion = createPromotion({
      code: "PROMO10",
      label: "Promotion",
      description: "10 percent promotional support",
    });

    expect(fee.amount.currency).toBe(Currency.ZAR);
    expect(discount.amount.amount).toBe(300);
    expect(markup.amount.amount).toBe(200);
    expect(commission.amount.amount).toBe(150);
    expect(promotion.code).toBe("PROMO10");
    expect(Object.isFrozen(fee)).toBe(true);
    expect(Object.isFrozen(discount)).toBe(true);
    expect(Object.isFrozen(markup)).toBe(true);
    expect(Object.isFrozen(commission)).toBe(true);
    expect(Object.isFrozen(promotion)).toBe(true);
  });
});

describe("Pricing Models", () => {
  it("provides aggregate-compatible immutable pricing contracts", () => {
    const composition = createAggregateComposition();
    const pricing = Pricing.create(composition);

    expect(pricing.summary.productType).toBe("JOURNEY");
    expect(pricing.breakdown.lineItems[0]?.totalAmount.amount).toBe(44000);
    expect(pricing.totals.grandTotal.currency).toBe(Currency.ZAR);
    expect(Object.isFrozen(pricing.breakdown.lineItems)).toBe(true);
  });
});

describe("Pricing Quotation Models", () => {
  it("constructs immutable quotation contracts", () => {
    const quote: Quote = createQuote({
      id: "quote-001",
      status: QuoteStatus.ISSUED,
      items: [
        createQuoteItem({
          code: "TOTAL",
          label: "Total quotation",
          amount: createMoney({ amount: 50300, currency: Currency.ZAR }),
          quantity: 1,
        }),
      ],
      total: createMoney({ amount: 50300, currency: Currency.ZAR }),
      metadata: createQuoteMetadata({
        createdAt: new Date("2026-08-07T00:00:00.000Z"),
        expiresAt: new Date("2026-08-14T00:00:00.000Z"),
        version: "1.0.0",
        source: "APP-005.2",
      }),
    });

    expect(quote.status).toBe(QuoteStatus.ISSUED);
    expect(quote.items[0]?.amount.amount).toBe(50300);
    expect(Object.isFrozen(quote)).toBe(true);
    expect(Object.isFrozen(quote.items)).toBe(true);
    expect(Object.isFrozen(quote.metadata)).toBe(true);
  });
});

import {
  createCommission,
  createDiscount,
  createFee,
  createMarkup,
  createMoney,
  createPricingBreakdown,
  createPricingLineItem,
  createPricingSummary,
  createPricingTotal,
  createPromotion,
  createQuote,
  createQuoteItem,
  createQuoteMetadata,
  createTax,
  createTaxBreakdown,
  Currency,
  QuoteStatus,
  TaxType,
} from "@application/pricing";
import {
  CommercialValidator,
  PricingIntegrityValidator,
  PricingRequestValidator,
  PricingValidationErrorCode,
  PricingValidationPipeline,
  PricingValidationRequest,
  QuoteReadinessValidator,
} from "@application/pricing/validation";

function createRequest(): PricingValidationRequest {
  return {
    currency: Currency.ZAR,
    summary: createPricingSummary({
      productId: "journey-1001",
      productType: "JOURNEY",
      description: "Cape Discovery",
    }),
    breakdown: createPricingBreakdown({
      lineItems: [
        createPricingLineItem({
          code: "BASE",
          label: "Base package",
          unitAmount: createMoney({ amount: 20000, currency: Currency.ZAR }),
          totalAmount: createMoney({ amount: 40000, currency: Currency.ZAR }),
          quantity: 2,
        }),
      ],
    }),
    taxes: createTaxBreakdown({
      entries: [
        createTax({
          code: "VAT",
          type: TaxType.VAT,
          amount: createMoney({ amount: 4000, currency: Currency.ZAR }),
        }),
      ],
      total: createMoney({ amount: 4000, currency: Currency.ZAR }),
    }),
    fees: [
      createFee({
        code: "SERVICE",
        label: "Service fee",
        amount: createMoney({ amount: 500, currency: Currency.ZAR }),
      }),
    ],
    discounts: [
      createDiscount({
        code: "LOYALTY",
        label: "Loyalty discount",
        amount: createMoney({ amount: 600, currency: Currency.ZAR }),
      }),
    ],
    markups: [
      createMarkup({
        code: "SEASON",
        label: "Seasonal markup",
        amount: createMoney({ amount: 300, currency: Currency.ZAR }),
      }),
    ],
    commissions: [
      createCommission({
        code: "AGENCY",
        label: "Agency commission",
        amount: createMoney({ amount: 700, currency: Currency.ZAR }),
      }),
    ],
    promotions: [
      createPromotion({
        code: "PROMO10",
        label: "Promotion",
      }),
    ],
    totals: createPricingTotal({
      subtotal: createMoney({ amount: 40000, currency: Currency.ZAR }),
      taxTotal: createMoney({ amount: 4000, currency: Currency.ZAR }),
      feeTotal: createMoney({ amount: 500, currency: Currency.ZAR }),
      discountTotal: createMoney({ amount: 600, currency: Currency.ZAR }),
      markupTotal: createMoney({ amount: 300, currency: Currency.ZAR }),
      commissionTotal: createMoney({ amount: 700, currency: Currency.ZAR }),
      grandTotal: createMoney({ amount: 43500, currency: Currency.ZAR }),
    }),
    quote: createQuote({
      id: "quote-1001",
      status: QuoteStatus.ISSUED,
      items: [
        createQuoteItem({
          code: "TOTAL",
          label: "Total",
          amount: createMoney({ amount: 43500, currency: Currency.ZAR }),
          quantity: 1,
        }),
      ],
      total: createMoney({ amount: 43500, currency: Currency.ZAR }),
      metadata: createQuoteMetadata({
        createdAt: new Date("2026-08-07T00:00:00.000Z"),
        expiresAt: new Date("2026-08-14T00:00:00.000Z"),
        version: "1.0.0",
        source: "test",
      }),
    }),
  };
}

describe("PricingRequestValidator", () => {
  it("passes valid requests", () => {
    const validator = new PricingRequestValidator();
    const result = validator.validate(createRequest());

    expect(result.valid).toBe(true);
  });

  it("fails when currency is missing", () => {
    const validator = new PricingRequestValidator();
    const result = validator.validate({
      ...createRequest(),
      currency: undefined,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.code === PricingValidationErrorCode.MISSING_CURRENCY)).toBe(true);
  });

  it("fails when pricing inputs are missing", () => {
    const validator = new PricingRequestValidator();
    const result = validator.validate({
      ...createRequest(),
      summary: undefined,
      totals: undefined,
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.code === PricingValidationErrorCode.MISSING_PRICING_INPUTS)).toBe(true);
  });
});

describe("CommercialValidator", () => {
  it("fails for invalid discounts, markups, commissions and promotions", () => {
    const validator = new CommercialValidator();
    const result = validator.validate({
      ...createRequest(),
      discounts: [
        createDiscount({
          code: "BAD-DISCOUNT",
          label: "Bad discount",
          amount: createMoney({ amount: -1, currency: Currency.ZAR }),
        }),
      ],
      markups: [
        createMarkup({
          code: "BAD-MARKUP",
          label: "Bad markup",
          amount: createMoney({ amount: -1, currency: Currency.ZAR }),
        }),
      ],
      commissions: [
        createCommission({
          code: "BAD-COMMISSION",
          label: "Bad commission",
          amount: createMoney({ amount: -1, currency: Currency.ZAR }),
        }),
      ],
      promotions: [
        createPromotion({
          code: "",
          label: "Invalid promotion",
        }),
      ],
    });

    expect(result.valid).toBe(false);
    expect(result.errors.map((error) => error.code)).toEqual(
      expect.arrayContaining([
        PricingValidationErrorCode.INVALID_DISCOUNT,
        PricingValidationErrorCode.INVALID_MARKUP,
        PricingValidationErrorCode.INVALID_COMMISSION,
        PricingValidationErrorCode.INVALID_PROMOTION,
      ]),
    );
  });
});

describe("PricingIntegrityValidator", () => {
  it("fails when totals mismatch", () => {
    const validator = new PricingIntegrityValidator();
    const result = validator.validate({
      ...createRequest(),
      totals: createPricingTotal({
        ...createRequest().totals!,
        grandTotal: createMoney({ amount: 1, currency: Currency.ZAR }),
      }),
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.code === PricingValidationErrorCode.TOTALS_MISMATCH)).toBe(true);
  });

  it("fails when taxes are missing", () => {
    const validator = new PricingIntegrityValidator();
    const result = validator.validate({
      ...createRequest(),
      taxes: undefined,
    });

    expect(result.errors.some((error) => error.code === PricingValidationErrorCode.MISSING_TAXES)).toBe(true);
  });

  it("flags missing fees", () => {
    const validator = new PricingIntegrityValidator();
    const result = validator.validate({
      ...createRequest(),
      fees: [],
    });

    expect(result.errors.some((error) => error.code === PricingValidationErrorCode.MISSING_FEES)).toBe(true);
  });

  it("fails for currency inconsistency", () => {
    const validator = new PricingIntegrityValidator();
    const result = validator.validate({
      ...createRequest(),
      fees: [
        createFee({
          code: "SERVICE",
          label: "Service fee",
          amount: createMoney({ amount: 500, currency: Currency.USD }),
        }),
      ],
    });

    expect(result.errors.some((error) => error.code === PricingValidationErrorCode.CURRENCY_INCONSISTENCY)).toBe(true);
  });
});

describe("QuoteReadinessValidator", () => {
  it("fails when quote expiry is missing", () => {
    const validator = new QuoteReadinessValidator();
    const quote = createRequest().quote!;
    const result = validator.validate({
      ...createRequest(),
      quote: {
        ...quote,
        metadata: undefined as unknown as typeof quote.metadata,
      },
    });

    expect(result.errors.some((error) => error.code === PricingValidationErrorCode.MISSING_QUOTE_METADATA)).toBe(true);
    expect(result.errors.some((error) => error.code === PricingValidationErrorCode.MISSING_QUOTE_EXPIRY)).toBe(true);
  });

  it("fails for incomplete quotation", () => {
    const validator = new QuoteReadinessValidator();
    const result = validator.validate({
      ...createRequest(),
      quote: createQuote({
        id: "quote-draft",
        status: QuoteStatus.DRAFT,
        items: [],
        total: createMoney({ amount: 0, currency: Currency.ZAR }),
        metadata: createQuoteMetadata({
          createdAt: new Date("2026-08-07T00:00:00.000Z"),
          expiresAt: new Date("2026-08-14T00:00:00.000Z"),
          version: "1.0.0",
          source: "test",
        }),
      }),
    });

    expect(result.errors.some((error) => error.code === PricingValidationErrorCode.INCOMPLETE_QUOTATION)).toBe(true);
  });
});

describe("PricingValidationPipeline", () => {
  it("executes validators in order", () => {
    const events: string[] = [];

    const pipeline = new PricingValidationPipeline({
      requestValidator: {
        validate: () => {
          events.push("request");
          return { valid: true, stage: "REQUEST", errors: [], warnings: [], metadata: { validatedAt: new Date(), version: "1.0.0", source: "test" } };
        },
      } as unknown as PricingRequestValidator,
      commercialValidator: {
        validate: () => {
          events.push("commercial");
          return { valid: true, stage: "COMMERCIAL", errors: [], warnings: [], metadata: { validatedAt: new Date(), version: "1.0.0", source: "test" } };
        },
      } as unknown as CommercialValidator,
      integrityValidator: {
        validate: () => {
          events.push("integrity");
          return { valid: true, stage: "INTEGRITY", errors: [], warnings: [], metadata: { validatedAt: new Date(), version: "1.0.0", source: "test" } };
        },
      } as unknown as PricingIntegrityValidator,
      quoteReadinessValidator: {
        validate: () => {
          events.push("quote");
          return { valid: true, stage: "QUOTE_READINESS", errors: [], warnings: [], metadata: { validatedAt: new Date(), version: "1.0.0", source: "test" } };
        },
      } as unknown as QuoteReadinessValidator,
    });

    const result = pipeline.execute(createRequest());

    expect(events).toEqual(["request", "commercial", "integrity", "quote"]);
    expect(result.valid).toBe(true);
  });

  it("stops on critical validation failures", () => {
    const events: string[] = [];

    const pipeline = new PricingValidationPipeline({
      requestValidator: {
        validate: () => {
          events.push("request");
          return {
            valid: false,
            stage: "REQUEST",
            errors: [
              {
                code: PricingValidationErrorCode.MISSING_CURRENCY,
                stage: "REQUEST",
                message: "Currency is required.",
                critical: true,
              },
            ],
            warnings: [],
            metadata: { validatedAt: new Date(), version: "1.0.0", source: "test" },
          };
        },
      } as unknown as PricingRequestValidator,
      commercialValidator: {
        validate: () => {
          events.push("commercial");
          throw new Error("should not run");
        },
      } as unknown as CommercialValidator,
      integrityValidator: {
        validate: () => {
          events.push("integrity");
          throw new Error("should not run");
        },
      } as unknown as PricingIntegrityValidator,
      quoteReadinessValidator: {
        validate: () => {
          events.push("quote");
          throw new Error("should not run");
        },
      } as unknown as QuoteReadinessValidator,
    });

    const result = pipeline.execute(createRequest());

    expect(events).toEqual(["request"]);
    expect(result.valid).toBe(false);
  });

  it("returns immutable result and supports concrete constructor injection", () => {
    const pipeline = new PricingValidationPipeline({
      requestValidator: new PricingRequestValidator(),
      commercialValidator: new CommercialValidator(),
      integrityValidator: new PricingIntegrityValidator(),
      quoteReadinessValidator: new QuoteReadinessValidator(),
    });

    const result = pipeline.execute(createRequest());

    expect(result.valid).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.errors)).toBe(true);
    expect(Object.isFrozen(result.warnings)).toBe(true);
    expect(Object.isFrozen(result.metadata)).toBe(true);
  });
}
);
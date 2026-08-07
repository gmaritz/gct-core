import {
  Pricing,
  PricingComposition,
} from "@application/pricing/aggregate";
import { Currency, TaxType } from "@application/pricing";

function createComposition(): PricingComposition {
  return {
    identity: {
      id: "pricing-001",
    },
    summary: {
      productId: "journey-2001",
      productType: "JOURNEY",
      description: "Cape Peninsula curated journey",
    },
    breakdown: {
      lineItems: [
        {
          code: "BASE",
          label: "Base package",
          unitAmount: { amount: 20000, currency: Currency.ZAR },
          totalAmount: { amount: 40000, currency: Currency.ZAR },
          quantity: 2,
        },
        {
          code: "EXPERIENCE",
          label: "Premium experience",
          unitAmount: { amount: 3500, currency: Currency.ZAR },
          totalAmount: { amount: 3500, currency: Currency.ZAR },
          quantity: 1,
        },
      ],
    },
    taxes: {
      entries: [
        {
          code: "VAT",
          type: TaxType.VAT,
          amount: { amount: 4200, currency: Currency.ZAR },
        },
      ],
      total: { amount: 4200, currency: Currency.ZAR },
    },
    fees: [
      {
        code: "SERVICE",
        label: "Service fee",
        amount: { amount: 600, currency: Currency.ZAR },
      },
    ],
    discounts: [
      {
        code: "LOYALTY",
        label: "Loyalty discount",
        amount: { amount: 800, currency: Currency.ZAR },
      },
    ],
    markups: [
      {
        code: "SEASONAL",
        label: "Seasonal markup",
        amount: { amount: 500, currency: Currency.ZAR },
      },
    ],
    commissions: [
      {
        code: "AGENCY",
        label: "Agency commission",
        amount: { amount: 1200, currency: Currency.ZAR },
      },
    ],
    totals: {
      subtotal: { amount: 43500, currency: Currency.ZAR },
      taxTotal: { amount: 4200, currency: Currency.ZAR },
      feeTotal: { amount: 600, currency: Currency.ZAR },
      discountTotal: { amount: 800, currency: Currency.ZAR },
      markupTotal: { amount: 500, currency: Currency.ZAR },
      commissionTotal: { amount: 1200, currency: Currency.ZAR },
      grandTotal: { amount: 48000, currency: Currency.ZAR },
    },
    currency: Currency.ZAR,
    metadata: {
      createdAt: new Date("2026-08-07T00:00:00.000Z"),
      updatedAt: new Date("2026-08-07T00:00:00.000Z"),
      version: "1.0.0",
      source: "APP-005.1",
    },
  };
}

describe("Pricing aggregate", () => {
  it("supports successful creation", () => {
    const pricing = Pricing.create(createComposition());

    expect(pricing.identity.id).toBe("pricing-001");
    expect(pricing.currency).toBe(Currency.ZAR);
    expect(pricing.breakdown.lineItems).toHaveLength(2);
    expect(pricing.totals.grandTotal.amount).toBe(48000);
  });

  it("fails creation when identifier is missing", () => {
    const composition = createComposition();

    expect(() =>
      Pricing.create({
        ...composition,
        identity: {
          id: "  ",
        },
      }),
    ).toThrow("Pricing identity is required.");
  });

  it("fails creation when totals are missing", () => {
    const composition = createComposition();

    expect(() =>
      Pricing.create({
        ...composition,
        totals: undefined as unknown as PricingComposition["totals"],
      }),
    ).toThrow("Pricing totals are required.");
  });

  it("fails creation when breakdown is missing", () => {
    const composition = createComposition();

    expect(() =>
      Pricing.create({
        ...composition,
        breakdown: undefined as unknown as PricingComposition["breakdown"],
      }),
    ).toThrow("Pricing breakdown is required.");
  });

  it("fails creation when currency is missing", () => {
    const composition = createComposition();

    expect(() =>
      Pricing.create({
        ...composition,
        currency: "" as unknown as PricingComposition["currency"],
      }),
    ).toThrow("Pricing currency is required.");
  });

  it("supports successful restoration", () => {
    const composition = createComposition();
    const pricing = Pricing.restore(composition);

    expect(pricing.identity.id).toBe("pricing-001");
    expect(pricing.summary.productId).toBe("journey-2001");
    expect(pricing.totals.grandTotal.amount).toBe(48000);
  });

  it("preserves immutable restoration", () => {
    const composition = createComposition();
    const pricing = Pricing.restore(composition);

    expect(Object.isFrozen(pricing)).toBe(true);
    expect(Object.isFrozen(pricing.identity)).toBe(true);
    expect(Object.isFrozen(pricing.summary)).toBe(true);
    expect(Object.isFrozen(pricing.breakdown)).toBe(true);
    expect(Object.isFrozen(pricing.breakdown.lineItems)).toBe(true);
    expect(Object.isFrozen(pricing.taxes.entries)).toBe(true);
    expect(Object.isFrozen(pricing.fees)).toBe(true);
    expect(Object.isFrozen(pricing.discounts)).toBe(true);
    expect(Object.isFrozen(pricing.markups)).toBe(true);
    expect(Object.isFrozen(pricing.commissions)).toBe(true);
    expect(Object.isFrozen(pricing.totals)).toBe(true);
    expect(Object.isFrozen(pricing.metadata)).toBe(true);
  });

  it("uses defensive copying for collections and dates", () => {
    const composition = createComposition();
    const pricing = Pricing.create(composition);
    const mutableLineItems = composition.breakdown.lineItems as unknown as Array<PricingComposition["breakdown"]["lineItems"][number]>;

    mutableLineItems[0] = {
      code: "CHANGED",
      label: "Changed",
      unitAmount: { amount: 1, currency: Currency.ZAR },
      totalAmount: { amount: 1, currency: Currency.ZAR },
      quantity: 1,
    };
    composition.metadata.createdAt.setFullYear(2030);

    expect(pricing.breakdown.lineItems[0]?.code).toBe("BASE");
    expect(pricing.metadata.createdAt.getFullYear()).toBe(2026);
  });

  it("exposes readonly aggregate contracts", () => {
    const pricing: Pricing = Pricing.create(createComposition());

    expect(pricing.summary.productType).toBe("JOURNEY");
  });
});

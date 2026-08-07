import {
  Pricing,
  PricingComposition,
} from "@application/pricing/aggregate";

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
          amount: 20000,
          quantity: 2,
        },
        {
          code: "EXPERIENCE",
          label: "Premium experience",
          amount: 3500,
          quantity: 1,
        },
      ],
    },
    taxes: {
      entries: [
        {
          code: "VAT",
          amount: 4200,
        },
      ],
    },
    fees: {
      entries: [
        {
          code: "SERVICE",
          amount: 600,
        },
      ],
    },
    discounts: {
      entries: [
        {
          code: "LOYALTY",
          amount: 800,
        },
      ],
    },
    markups: {
      entries: [
        {
          code: "SEASONAL",
          amount: 500,
        },
      ],
    },
    commissions: {
      entries: [
        {
          code: "AGENCY",
          amount: 1200,
        },
      ],
    },
    totals: {
      subtotal: 43500,
      taxTotal: 4200,
      feeTotal: 600,
      discountTotal: 800,
      markupTotal: 500,
      commissionTotal: 1200,
      grandTotal: 48000,
    },
    currency: "ZAR",
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
    expect(pricing.currency).toBe("ZAR");
    expect(pricing.breakdown.lineItems).toHaveLength(2);
    expect(pricing.totals.grandTotal).toBe(48000);
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
        currency: "",
      }),
    ).toThrow("Pricing currency is required.");
  });

  it("supports successful restoration", () => {
    const composition = createComposition();
    const pricing = Pricing.restore(composition);

    expect(pricing.identity.id).toBe("pricing-001");
    expect(pricing.summary.productId).toBe("journey-2001");
    expect(pricing.totals.grandTotal).toBe(48000);
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
    expect(Object.isFrozen(pricing.fees.entries)).toBe(true);
    expect(Object.isFrozen(pricing.discounts.entries)).toBe(true);
    expect(Object.isFrozen(pricing.markups.entries)).toBe(true);
    expect(Object.isFrozen(pricing.commissions.entries)).toBe(true);
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
      amount: 1,
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

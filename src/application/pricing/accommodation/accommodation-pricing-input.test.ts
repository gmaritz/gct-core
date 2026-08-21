import { JourneyAccommodationPricingInput } from "@application/journeys/models";
import {
  Currency,
  createMoney,
  createPricingBreakdown,
  createPricingLineItem,
  createPricingSummary,
  createPricingTotal,
} from "@application/pricing";
import {
  createAccommodationPricingComponents,
  withAccommodationPricingInputs,
} from "./accommodation-pricing-input";

function createInput(stopId: string, accommodationId: string, amount: number): JourneyAccommodationPricingInput {
  const rate = {
    reference: { provider: "supplier-a", opaqueReference: `${stopId}-rate` },
    status: "BOOKABLE" as const,
    pricing: { amount, currency: "ZAR", basis: "TOTAL_STAY" },
    occupancy: { rooms: [{ adults: 2, children: 1, childAges: [8] }, { adults: 2, children: 0, childAges: [] }] },
    cancellationPolicies: [],
    taxes: [],
  };
  return {
    packageStopId: stopId,
    accommodationId,
    room: {
      reference: { provider: "supplier-a", opaqueReference: `${stopId}-room` },
      name: "Deluxe Room",
      rateOptions: [rate],
    },
    rate,
    occupancy: rate.occupancy,
  };
}

function createBaseRequest(): ReturnType<typeof withAccommodationPricingInputs> {
  return {
    currency: Currency.ZAR,
    summary: createPricingSummary({ productId: "package-1", productType: "PACKAGE", description: "Package" }),
    breakdown: createPricingBreakdown({
      lineItems: [createPricingLineItem({
        code: "BASE",
        label: "Base package",
        unitAmount: createMoney({ amount: 1000, currency: Currency.ZAR }),
        totalAmount: createMoney({ amount: 1000, currency: Currency.ZAR }),
        quantity: 1,
      })],
    }),
    taxes: null,
    fees: [], discounts: [], markups: [], commissions: [], promotions: [],
    totals: createPricingTotal({
      subtotal: createMoney({ amount: 1000, currency: Currency.ZAR }),
      taxTotal: createMoney({ amount: 0, currency: Currency.ZAR }),
      feeTotal: createMoney({ amount: 0, currency: Currency.ZAR }),
      discountTotal: createMoney({ amount: 0, currency: Currency.ZAR }),
      markupTotal: createMoney({ amount: 0, currency: Currency.ZAR }),
      commissionTotal: createMoney({ amount: 0, currency: Currency.ZAR }),
      grandTotal: createMoney({ amount: 1000, currency: Currency.ZAR }),
    }),
  };
}

describe("APP-005 accommodation pricing integration", () => {
  it("creates one traceable accommodation component and incorporates its supplier price", () => {
    const request = withAccommodationPricingInputs(createBaseRequest(), [createInput("stop-1", "hotel-a", 250)]);
    const item = request.breakdown!.lineItems[1]!;

    expect(item.code).toBe("ACCOMMODATION:stop-1");
    expect(item.totalAmount.amount).toBe(250);
    expect(item.metadata).toMatchObject({
      packageStopId: "stop-1",
      accommodationId: "hotel-a",
      roomReference: "stop-1-room",
      rateReference: "stop-1-rate",
      pricingBasis: "TOTAL_STAY",
      occupancyRoomCount: "2",
      childAges: "8",
    });
    expect(request.totals?.subtotal.amount).toBe(1250);
    expect(request.totals?.grandTotal.amount).toBe(1250);
  });

  it("preserves independent components for multiple stops, including repeated properties", () => {
    const request = withAccommodationPricingInputs(createBaseRequest(), [
      createInput("stop-1", "hotel-a", 250),
      createInput("stop-2", "hotel-a", 400),
      createInput("stop-3", "hotel-b", 600),
    ]);

    expect(request.breakdown?.lineItems.filter((item) => item.code.startsWith("ACCOMMODATION:"))).toHaveLength(3);
    expect(request.totals?.subtotal.amount).toBe(2250);
  });

  it("rejects duplicate stop inputs and missing/non-positive prices", () => {
    expect(() => createAccommodationPricingComponents([
      createInput("stop-1", "hotel-a", 250),
      createInput("stop-1", "hotel-b", 300),
    ])).toThrow("Duplicate accommodation pricing input");

    expect(() => createAccommodationPricingComponents([createInput("stop-1", "hotel-a", 0)])).toThrow("positive supplier price");
  });

  it("rejects currency mismatches rather than inventing conversion", () => {
    const input = createInput("stop-1", "hotel-a", 250);
    const mismatched = {
      ...input,
      rate: { ...input.rate, pricing: { ...input.rate.pricing, currency: "EUR" } },
    };
    expect(() => withAccommodationPricingInputs(createBaseRequest(), [mismatched])).toThrow("currency");
  });

  it("is idempotent when no accommodation inputs are supplied", () => {
    const request = createBaseRequest();
    expect(withAccommodationPricingInputs(request, [])).toBe(request);
  });
});

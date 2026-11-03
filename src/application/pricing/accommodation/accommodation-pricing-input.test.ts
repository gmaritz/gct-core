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
  AccommodationCurrencyError,
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
    expect(() => withAccommodationPricingInputs(createBaseRequest(), [mismatched])).toThrow(AccommodationCurrencyError);
  });

  it.each(["UNKNOWN", ""])("never treats unknown or missing currency %p as ZAR", (currency) => {
    const input = createInput("stop-1", "hotel-a", 250);
    const unknown = { ...input, rate: { ...input.rate, pricing: { ...input.rate.pricing, currency } } };
    expect(() => withAccommodationPricingInputs(createBaseRequest(), [unknown])).toThrow(AccommodationCurrencyError);
  });

  describe("CUR-001 room-rate currency integrity", () => {
    function createMultiRoomInput(
      aggregateCurrency: string,
      roomCurrencies: ReadonlyArray<string>,
    ): JourneyAccommodationPricingInput {
      const base = createInput("stop-1", "hotel-a", 500);
      const roomRates = roomCurrencies.map((currency, index) => {
        const rate = {
          ...base.rate,
          reference: { provider: "supplier-a", opaqueReference: `stop-1-rate-${index + 1}` },
          pricing: { amount: 250, currency, basis: "TOTAL_STAY" },
          occupancy: { rooms: [{ adults: 2, children: 0, childAges: [] }] },
        };
        return {
          roomSlotId: `stop-1-room-${index + 1}`,
          room: { ...base.room, reference: { provider: "supplier-a", opaqueReference: `stop-1-room-${index + 1}` }, rateOptions: [rate] },
          rate,
        };
      });
      return {
        ...base,
        rate: { ...base.rate, pricing: { amount: 500, currency: aggregateCurrency, basis: "TOTAL_STAY" } },
        roomRates,
      };
    }

    function createEurBaseRequest(): ReturnType<typeof withAccommodationPricingInputs> {
      const zar = createBaseRequest();
      const money = (amount: number): ReturnType<typeof createMoney> => createMoney({ amount, currency: Currency.EUR });
      return {
        ...zar,
        currency: Currency.EUR,
        breakdown: createPricingBreakdown({
          lineItems: [createPricingLineItem({
            code: "BASE", label: "Base package", unitAmount: money(1000), totalAmount: money(1000), quantity: 1,
          })],
        }),
        totals: createPricingTotal({
          subtotal: money(1000), taxTotal: money(0), feeTotal: money(0), discountTotal: money(0),
          markupTotal: money(0), commissionTotal: money(0), grandTotal: money(1000),
        }),
      };
    }

    it("aggregates multiple ZAR room rates without altering amount or currency", () => {
      const [component] = createAccommodationPricingComponents([createMultiRoomInput("ZAR", ["ZAR", "ZAR"])]);

      expect(component?.amount).toBe(500);
      expect(component?.currency).toBe(Currency.ZAR);
      const request = withAccommodationPricingInputs(createBaseRequest(), [createMultiRoomInput("ZAR", ["ZAR", "ZAR"])]);
      expect(request.totals?.grandTotal.amount).toBe(1500);
      expect(request.totals?.grandTotal.currency).toBe(Currency.ZAR);
    });

    it("aggregates multiple EUR room rates under an EUR commercial request without conversion", () => {
      const [component] = createAccommodationPricingComponents([createMultiRoomInput("EUR", ["EUR", "EUR"])]);

      expect(component?.amount).toBe(500);
      expect(component?.currency).toBe(Currency.EUR);
      const request = withAccommodationPricingInputs(createEurBaseRequest(), [createMultiRoomInput("EUR", ["EUR", "EUR"])]);
      expect(request.totals?.grandTotal).toEqual({ amount: 1500, currency: Currency.EUR });
    });

    it.each([
      ["ZAR and EUR room rates under a ZAR aggregate", "ZAR", ["ZAR", "EUR"]],
      ["EUR and ZAR room rates under an EUR aggregate", "EUR", ["EUR", "ZAR"]],
      ["an aggregate that differs from every room rate", "ZAR", ["EUR", "EUR"]],
      ["an aggregate that differs from some room rates", "EUR", ["ZAR", "EUR"]],
      ["a missing room-rate currency", "ZAR", ["ZAR", ""]],
      ["an unknown room-rate currency", "ZAR", ["ZAR", "UNKNOWN"]],
    ])("rejects %s before aggregation", (_label, aggregate, roomCurrencies) => {
      const input = createMultiRoomInput(aggregate, roomCurrencies);

      expect(() => createAccommodationPricingComponents([input])).toThrow(AccommodationCurrencyError);
      expect(() => withAccommodationPricingInputs(createBaseRequest(), [input])).toThrow(AccommodationCurrencyError);
    });

    it("keeps single-currency pricing inputs without room rates unchanged", () => {
      const [component] = createAccommodationPricingComponents([createInput("stop-1", "hotel-a", 250)]);

      expect(component?.amount).toBe(250);
      expect(component?.currency).toBe(Currency.ZAR);
    });
  });

  it("is idempotent when no accommodation inputs are supplied", () => {
    const request = createBaseRequest();
    expect(withAccommodationPricingInputs(request, [])).toBe(request);
  });
});

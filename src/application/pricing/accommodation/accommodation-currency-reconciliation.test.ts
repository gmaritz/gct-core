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
  withAccommodationPricingInputs,
} from "./accommodation-pricing-input";
import {
  AccommodationCurrencyPolicyError,
  createFixedRatePolicy,
  loadAccommodationCurrencyPolicy,
  STRICT_SAME_CURRENCY_POLICY,
} from "./accommodation-currency-policy";

function createInput(stopId: string, amount: number, currency: string): JourneyAccommodationPricingInput {
  const rate = {
    reference: { provider: "supplier-a", opaqueReference: `${stopId}-rate` },
    status: "BOOKABLE" as const,
    pricing: { amount, currency, basis: "TOTAL_STAY" },
    occupancy: { rooms: [{ adults: 2, children: 0, childAges: [] }] },
    cancellationPolicies: [],
    taxes: [],
  };
  return {
    packageStopId: stopId,
    accommodationId: `hotel-${stopId}`,
    room: { reference: { provider: "supplier-a", opaqueReference: `${stopId}-room` }, name: "Room", rateOptions: [rate] },
    rate,
    occupancy: rate.occupancy,
  };
}

function zarBase(amount: number): ReturnType<typeof withAccommodationPricingInputs> {
  const money = (value: number): ReturnType<typeof createMoney> => createMoney({ amount: value, currency: Currency.ZAR });
  return {
    currency: Currency.ZAR,
    summary: createPricingSummary({ productId: "package-1", productType: "PACKAGE", description: "Package" }),
    breakdown: createPricingBreakdown({
      lineItems: [createPricingLineItem({ code: "BASE", label: "Base", unitAmount: money(amount), totalAmount: money(amount), quantity: 1 })],
    }),
    taxes: null,
    fees: [], discounts: [], markups: [], commissions: [], promotions: [],
    totals: createPricingTotal({
      subtotal: money(amount), taxTotal: money(0), feeTotal: money(0), discountTotal: money(0),
      markupTotal: money(0), commissionTotal: money(0), grandTotal: money(amount),
    }),
  };
}

const fixedEurZar = createFixedRatePolicy([{ from: Currency.EUR, to: Currency.ZAR, rate: 18.6 }]);

describe("CUR-002 accommodation currency policy configuration", () => {
  it("defaults to strict same-currency with no rates", () => {
    expect(loadAccommodationCurrencyPolicy({})).toBe(STRICT_SAME_CURRENCY_POLICY);
    expect(loadAccommodationCurrencyPolicy({ ACCOMMODATION_CURRENCY_POLICY: "STRICT_SAME_CURRENCY" }).fixedRates).toHaveLength(0);
  });

  it("loads the explicitly configured EUR/ZAR rate", () => {
    const policy = loadAccommodationCurrencyPolicy({
      ACCOMMODATION_CURRENCY_POLICY: "FIXED_RATE",
      ACCOMMODATION_FIXED_RATE_EUR_ZAR: "18.60",
    });
    expect(policy.policyId).toBe("CONFIGURED_FIXED_RATE");
    expect(policy.fixedRates).toEqual([{ from: Currency.EUR, to: Currency.ZAR, rate: 18.6 }]);
  });

  it.each([
    ["missing rate", { ACCOMMODATION_CURRENCY_POLICY: "FIXED_RATE" }],
    ["empty rate", { ACCOMMODATION_CURRENCY_POLICY: "FIXED_RATE", ACCOMMODATION_FIXED_RATE_EUR_ZAR: " " }],
    ["zero rate", { ACCOMMODATION_CURRENCY_POLICY: "FIXED_RATE", ACCOMMODATION_FIXED_RATE_EUR_ZAR: "0" }],
    ["negative rate", { ACCOMMODATION_CURRENCY_POLICY: "FIXED_RATE", ACCOMMODATION_FIXED_RATE_EUR_ZAR: "-1" }],
    ["non-finite rate", { ACCOMMODATION_CURRENCY_POLICY: "FIXED_RATE", ACCOMMODATION_FIXED_RATE_EUR_ZAR: "Infinity" }],
    ["non-numeric rate", { ACCOMMODATION_CURRENCY_POLICY: "FIXED_RATE", ACCOMMODATION_FIXED_RATE_EUR_ZAR: "18,60" }],
    ["unknown mode", { ACCOMMODATION_CURRENCY_POLICY: "LIVE_FX" }],
  ])("fails closed for %s", (_label, env) => {
    expect(() => loadAccommodationCurrencyPolicy(env)).toThrow(AccommodationCurrencyPolicyError);
  });

  it("rejects non-positive rates when building a policy directly", () => {
    expect(() => createFixedRatePolicy([{ from: Currency.EUR, to: Currency.ZAR, rate: 0 }])).toThrow(AccommodationCurrencyPolicyError);
    expect(() => createFixedRatePolicy([{ from: Currency.EUR, to: Currency.ZAR, rate: Number.NaN }])).toThrow(AccommodationCurrencyPolicyError);
  });
});

describe("CUR-002 accommodation currency reconciliation", () => {
  it("adds ZAR accommodation directly with no conversion metadata", () => {
    const request = withAccommodationPricingInputs(zarBase(1000), [createInput("stop-1", 250, "ZAR")], fixedEurZar);
    const item = request.breakdown!.lineItems[1]!;

    expect(item.totalAmount).toEqual({ amount: 250, currency: Currency.ZAR });
    expect(item.metadata?.conversionRate).toBeUndefined();
    expect(request.totals?.grandTotal.amount).toBe(1250);
  });

  it("converts EUR accommodation only, at 18.60, and preserves the supplier amount", () => {
    const request = withAccommodationPricingInputs(zarBase(51376), [createInput("stop-1", 596.68, "EUR")], fixedEurZar);
    const [base, accommodation] = request.breakdown!.lineItems;

    expect(base!.totalAmount.amount).toBe(51376);
    expect(accommodation!.totalAmount).toEqual({ amount: 11098.25, currency: Currency.ZAR });
    expect(accommodation!.metadata).toMatchObject({
      supplierAmount: "596.68",
      supplierCurrency: "EUR",
      conversionRate: "18.6",
      convertedAmount: "11098.25",
      convertedCurrency: "ZAR",
      conversionPolicyId: "CONFIGURED_FIXED_RATE",
    });
    expect(request.totals?.grandTotal).toEqual({ amount: 62474.25, currency: Currency.ZAR });
  });

  it("converts multiple stops independently and the total reconciles with its components", () => {
    const request = withAccommodationPricingInputs(zarBase(51376), [
      createInput("stop-1", 596.68, "EUR"),
      createInput("stop-2", 135.26, "EUR"),
      createInput("stop-3", 100, "ZAR"),
    ], fixedEurZar);
    const amounts = request.breakdown!.lineItems.map((item) => item.totalAmount.amount);

    expect(amounts).toEqual([51376, 11098.25, 2515.84, 100]);
    const sum = Math.round(amounts.reduce((total, amount) => total + amount, 0) * 100) / 100;
    expect(request.totals?.grandTotal.amount).toBe(sum);
    expect(request.totals?.subtotal.amount).toBe(sum);
    expect(sum).toBe(65090.09);
  });

  it("rounds half-up once at ZAR minor units without intermediate rounding", () => {
    const policy = createFixedRatePolicy([{ from: Currency.EUR, to: Currency.ZAR, rate: 18.605 }]);
    const request = withAccommodationPricingInputs(zarBase(0), [createInput("stop-1", 1.01, "EUR")], policy);
    // 1.01 x 18.605 = 18.79105 -> 18.79
    expect(request.breakdown!.lineItems[1]!.totalAmount.amount).toBe(18.79);
  });

  it.each([
    ["strict policy", STRICT_SAME_CURRENCY_POLICY],
    ["policy without the pair", createFixedRatePolicy([])],
  ])("fails closed for EUR accommodation under %s", (_label, policy) => {
    expect(() => withAccommodationPricingInputs(zarBase(1000), [createInput("stop-1", 100, "EUR")], policy))
      .toThrow(AccommodationCurrencyError);
  });

  it("fails closed for an unsupported pair even if EUR/ZAR is configured", () => {
    expect(() => withAccommodationPricingInputs(zarBase(1000), [createInput("stop-1", 100, "GBP")], fixedEurZar))
      .toThrow(AccommodationCurrencyError);
  });

  it("never applies an EUR/ZAR rate in the reverse direction", () => {
    const eurBase = { ...zarBase(1000), currency: Currency.EUR };
    expect(() => withAccommodationPricingInputs(eurBase, [createInput("stop-1", 100, "ZAR")], fixedEurZar))
      .toThrow(AccommodationCurrencyError);
  });
});

import { Express } from "express";

import { Journey, JourneyLifecycle, JourneyStatus } from "../../../src/application/journeys";
import { PricingEngine } from "../../../src/application/pricing";
import { createTestApplication } from "../../helpers/application.helper";
import { createRequest, getCsrfToken } from "../../helpers/request.helper";

const journeyId = "journey-homepage-journey-001";
const stopIds = ["stop-1", "stop-2"] as const;
const supplierAmounts = [596.68, 135.26] as const;
let mockCurrencies: ReadonlyArray<string> = ["EUR", "EUR"];

function createSupplierJourney(currencies: ReadonlyArray<string>): Journey {
  return Journey.create({
    identity: { id: journeyId },
    classification: { type: "PACKAGE", category: "SIGNATURE" },
    metadata: { created: new Date(), modified: new Date(), version: "1.0.0", source: "CUR-002" },
    status: JourneyStatus.PUBLISHED,
    lifecycle: JourneyLifecycle.BOOKABLE,
    duration: { days: 4, nights: 3, description: "4 Days / 3 Nights" },
    destinations: [{ name: "Cape Winelands" }],
    accommodation: stopIds.map((stopId, index) => ({
      accommodationId: `hotel-${stopId}`,
      name: `Hotel ${stopId}`,
      provider: "hotelbeds",
      packageStop: {
        packageId: journeyId,
        stopId,
        stopOrder: index + 1,
        checkInDate: new Date(`2026-11-0${index + 1}T00:00:00.000Z`),
        checkOutDate: new Date(`2026-11-0${index + 2}T00:00:00.000Z`),
      },
      requestedOccupancy: { rooms: [{ adults: 2, children: 0, childAges: [] }] },
      roomOptions: [{
        reference: { provider: "hotelbeds", opaqueReference: `room-${stopId}` },
        name: "Double Room",
        rateOptions: [{
          reference: { provider: "hotelbeds", opaqueReference: `rate-${stopId}` },
          status: "BOOKABLE" as const,
          pricing: { amount: supplierAmounts[index]!, currency: currencies[index]!, basis: "TOTAL_STAY" },
          occupancy: { rooms: [{ adults: 2, children: 0, childAges: [] }] },
          cancellationPolicies: [],
          taxes: [],
        }],
      }],
    })),
    experiences: [],
    travellerRules: { minimumTravellers: 2, maximumTravellers: 8, privateOnly: true },
    tags: [],
  });
}

jest.mock("../../../src/infrastructure/merchandising/frontend-journey-resolver", () => ({
  createFrontendJourneyResolver: (): { resolve: () => Promise<{ status: string; journey: Journey }> } => ({
    resolve: async (): Promise<{ status: string; journey: Journey }> => ({ status: "RESOLVED", journey: createSupplierJourney(mockCurrencies) }),
  }),
}));

function selectionForm(): Record<string, string> {
  const form: Record<string, string> = {};
  stopIds.forEach((stopId, index) => {
    form[`selections[${index}][stopId]`] = stopId;
    form[`selections[${index}][accommodationId]`] = `hotel-${stopId}`;
    form[`selections[${index}][roomReference][provider]`] = "hotelbeds";
    form[`selections[${index}][roomReference][opaqueReference]`] = `room-${stopId}`;
    form[`selections[${index}][rateReference][provider]`] = "hotelbeds";
    form[`selections[${index}][rateReference][opaqueReference]`] = `rate-${stopId}`;
  });
  return form;
}

describe("CUR-002 configurable accommodation currency reconciliation through the Cape Winelands quote path", () => {
  const originalEnv = process.env;
  let app: Express;
  let executeSpy: jest.SpyInstance;

  beforeAll(async () => {
    app = await createTestApplication();
  });

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.ACCOMMODATION_CURRENCY_POLICY;
    delete process.env.ACCOMMODATION_FIXED_RATE_EUR_ZAR;
    executeSpy = jest.spyOn(PricingEngine.prototype, "execute");
  });

  afterEach(() => {
    process.env = originalEnv;
    executeSpy.mockRestore();
  });

  async function selectAccommodation(currencies: ReadonlyArray<string>): Promise<void> {
    mockCurrencies = currencies;
    const csrfToken = await getCsrfToken(app);
    const response = await createRequest(app, "post")(`/ui/journeys/${journeyId}/accommodation`)
      .set("X-CSRF-Token", csrfToken)
      .type("form")
      .send(selectionForm());
    expect(response.status).toBe(200);
  }

  it("produces one reconciled ZAR quote for two EUR stops at the configured 18.60 rate", async () => {
    process.env.ACCOMMODATION_CURRENCY_POLICY = "FIXED_RATE";
    process.env.ACCOMMODATION_FIXED_RATE_EUR_ZAR = "18.60";
    await selectAccommodation(["EUR", "EUR"]);

    const response = await createRequest(app, "get")(`/ui/journeys/${journeyId}/quote`);

    // 596.68 x 18.60 = 11098.248 -> 11098.25 ; 135.26 x 18.60 = 2515.836 -> 2515.84 ; 51376 + 13614.09 = 64990.09
    expect(response.status).toBe(200);
    expect(response.text).toContain("Journey quote");
    expect(response.text).toMatch(/supplier price EUR 596[.,]68 at fixed rate 1 EUR = 18\.6 ZAR/);
    expect(response.text).toMatch(/supplier price EUR 135[.,]26/);
    expect(response.text).toContain("Continue to guest information");
    expect(response.text).not.toContain("Pending currency confirmation");
    const result = await executeSpy.mock.results[0]!.value;
    expect(result.pricing.currency).toBe("ZAR");
    expect(result.pricing.totals.grandTotal.amount).toBe(64990.09);
    const items = result.pricing.breakdown.lineItems;
    expect(items.map((item: { totalAmount: { amount: number } }) => item.totalAmount.amount)).toEqual([51376, 11098.25, 2515.84]);
    expect(items[1].metadata).toMatchObject({
      supplierAmount: "596.68",
      supplierCurrency: "EUR",
      conversionRate: "18.6",
      convertedAmount: "11098.25",
      convertedCurrency: "ZAR",
      conversionPolicyId: "CONFIGURED_FIXED_RATE",
    });
  });

  it.each([
    ["no configuration (strict same-currency default)", {}],
    ["fixed-rate mode without a rate", { ACCOMMODATION_CURRENCY_POLICY: "FIXED_RATE" }],
    ["a zero rate", { ACCOMMODATION_CURRENCY_POLICY: "FIXED_RATE", ACCOMMODATION_FIXED_RATE_EUR_ZAR: "0" }],
    ["a negative rate", { ACCOMMODATION_CURRENCY_POLICY: "FIXED_RATE", ACCOMMODATION_FIXED_RATE_EUR_ZAR: "-18.6" }],
    ["a non-numeric rate", { ACCOMMODATION_CURRENCY_POLICY: "FIXED_RATE", ACCOMMODATION_FIXED_RATE_EUR_ZAR: "abc" }],
    ["an unknown policy mode", { ACCOMMODATION_CURRENCY_POLICY: "LIVE_FX" }],
  ])("fails closed with HTTP 409 for EUR accommodation with %s", async (_label, env) => {
    Object.assign(process.env, env);
    await selectAccommodation(["EUR", "EUR"]);

    const response = await createRequest(app, "get")(`/ui/journeys/${journeyId}/quote`);

    expect(response.status).toBe(409);
    expect(response.text).toContain("Pending currency confirmation");
    expect(executeSpy).not.toHaveBeenCalled();
  });

  it("fails closed for an unsupported currency pair even when the EUR/ZAR rate is configured", async () => {
    process.env.ACCOMMODATION_CURRENCY_POLICY = "FIXED_RATE";
    process.env.ACCOMMODATION_FIXED_RATE_EUR_ZAR = "18.60";
    await selectAccommodation(["GBP", "EUR"]);

    const response = await createRequest(app, "get")(`/ui/journeys/${journeyId}/quote`);

    expect(response.status).toBe(409);
    expect(executeSpy).not.toHaveBeenCalled();
  });

  it("adds ZAR accommodation directly without conversion even when fixed-rate mode is configured", async () => {
    process.env.ACCOMMODATION_CURRENCY_POLICY = "FIXED_RATE";
    process.env.ACCOMMODATION_FIXED_RATE_EUR_ZAR = "18.60";
    await selectAccommodation(["ZAR", "ZAR"]);

    const response = await createRequest(app, "get")(`/ui/journeys/${journeyId}/quote`);

    expect(response.status).toBe(200);
    const result = await executeSpy.mock.results[0]!.value;
    expect(result.pricing.totals.grandTotal.amount).toBe(51376 + 596.68 + 135.26);
    expect(result.pricing.breakdown.lineItems[1].metadata.conversionRate).toBeUndefined();
  });
});
